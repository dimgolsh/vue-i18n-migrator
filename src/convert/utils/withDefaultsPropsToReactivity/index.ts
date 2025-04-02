import { isSFC, parseVueFromContent } from '../../utils';
import { ConvertResult } from '../../types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { convertObjectPattern, convertObjectProperty, replacePropsMemberExpression } from '../../defineProps';
import generate from '@babel/generator';
import { generateVue } from '../../generateVue';
import { formatCode } from '../../formatCode';

const convertProps = async (content: string) => {
	const ast = parse(content, {
		sourceType: 'module',
		plugins: ['typescript'],
		attachComment: true,
	});

	let newProperties: t.ObjectProperty[] = [];
	let oldProperties: t.ObjectProperty[] = [];
	let defineProps: t.CallExpression;

	traverse(ast, {
		CallExpression(path) {
			if (t.isIdentifier(path.node.callee)) {
				if (path.node.callee.name === 'withDefaults') {
					defineProps = path.node.arguments[0] as t.CallExpression;
					const properties = path.node.arguments[1] as t.ObjectExpression;
					oldProperties = properties.properties.filter((prop) => t.isObjectProperty(prop)) as t.ObjectProperty[];
					newProperties = properties.properties.map((prop) => convertObjectProperty(prop as t.ObjectProperty));

					path.replaceWith(defineProps);

					if (path.parent && t.isVariableDeclarator(path.parent)) {
						path.parent.id = t.objectPattern(newProperties);
					}

					path.skip();
				}
			}
		},
	});

	traverse(ast, {
		ExpressionStatement(path) {
			if (t.isCallExpression(path.node.expression) && t.isIdentifier(path.node.expression.callee)) {
				if (path.node.expression.callee.name === 'defineProps') {
					path.replaceWith(convertObjectPattern(defineProps, oldProperties));
				}
			}
		},
	});

	return ast;
};

export const withDefaultsPropsToReactivityProps = async (content: string): Promise<ConvertResult> => {
	if (!content) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ File is empty'],
		};
	}

	try {
		if (!isSFC(content)) {
			const newAst = await convertProps(content);
			const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

			return {
				isOk: true,
				content: code,
				errors: [],
			};
		} else {
			const desc = parseVueFromContent(content);

			if (!desc.scriptSetup) {
				return {
					isOk: false,
					content: '',
					errors: ['⚠ Vue file is not contain script setup'],
				};
			}

			const newAst = await convertProps(desc.scriptSetup.content);

			replacePropsMemberExpression(newAst);
			const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;
			const rawVue = generateVue(desc, code);
			const format = await formatCode(rawVue);

			return {
				isOk: true,
				content: format,
				errors: [],
			};
		}
	} catch (e) {
		console.log(e);
		console.error('\n Failed to convert \n');
		return {
			isOk: false,
			content: '',
			errors: ['⚠ Failed to convert', e.toString()],
		};
	}
};
