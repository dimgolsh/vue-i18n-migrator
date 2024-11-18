import { isSFC, parseVueFromContent } from '../../utils';
import { ConvertResult } from '../../types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { getDefinePropsFromObjectExpression } from '../../defineProps';
import generate from '@babel/generator';
import { generateVue } from '../../generateVue';
import { formatCode } from '../../formatCode';

const convertProps = async (content: string) => {
	const ast = parse(content, {
		sourceType: 'module',
		plugins: ['typescript'],
		attachComment: true,
	});

	traverse(ast, {
		CallExpression(path) {
			if (t.isIdentifier(path.node.callee)) {
				if (path.node.callee.name === 'defineProps') {
					const args = path.node.arguments[0];
					if (t.isObjectExpression(args)) {
						const newProps = getDefinePropsFromObjectExpression(args);
						path.replaceWith(newProps);
						path.skip();
					}
				}
			}
		},
	});

	return ast;
};

export const definePropsToWithDefaults = async (content: string): Promise<ConvertResult> => {
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
