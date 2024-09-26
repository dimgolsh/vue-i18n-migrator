import { parse } from '@babel/parser';

import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { getDefineComponent, parseVueFromContent, wrapNewLineComment } from './utils';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { getDefineEmit } from './defineEmits';
import { addImport, getImports } from './imports';
import { getDefineOptions } from './defineOptions';
import { getDefineProps } from './defineProps';
import { getSetupContent } from './setup';
import { getOtherNodes } from './other';
import { getComponents } from './components';
import { getUseSlots } from './useSlots';
import { getUseAttrs } from './useAttrs';

interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export const convert = async (content: string): Promise<ConvertResult> => {
	try {
		const desc = parseVueFromContent(content);

		if (desc.scriptSetup) {
			return {
				isOk: false,
				content: '',
				errors: ['⚠ File is already setup'],
			};
		}

		if (!desc.script) {
			return {
				isOk: false,
				content: '',
				errors: ['⚠ Vue file is not contain script'],
			};
		}

		if (desc.script.lang !== 'ts') {
			return {
				isOk: false,
				content: '',
				errors: ['⚠ Vue file is not typescript'],
			};
		}

		const ast = parse(desc.script.content, {
			sourceType: 'module',
			plugins: ['typescript'],
		});

		let pathNode: t.ObjectExpression = null;

		traverse(ast, {
			ExportDefaultDeclaration(path) {
				pathNode = getDefineComponent(path);
			},
		});

		const defineOptionsNode = getDefineOptions(pathNode);
		const props = getDefineProps(pathNode);
		const emits = getDefineEmit(pathNode, ast);
		const setupContent = getSetupContent(pathNode);
		const components = getComponents(pathNode);

		const imports = getImports(ast);
		const otherNodes = getOtherNodes(ast);
		const slots = getUseSlots(pathNode);
		const attrs = getUseAttrs(pathNode);

		if (slots) {
			addImport(imports, { source: 'vue', specifier: 'useSlots' });
		}

		if (attrs) {
			addImport(imports, { source: 'vue', specifier: 'useAttrs' });
		}

		const body: t.Statement[] = [
			...imports,
			...components.map((n) => wrapNewLineComment(n)),
			...otherNodes.map((n) => wrapNewLineComment(n)),
			wrapNewLineComment(defineOptionsNode),
			wrapNewLineComment(props),
			wrapNewLineComment(emits),
			wrapNewLineComment(slots),
			wrapNewLineComment(attrs),
			...setupContent.map((v) => wrapNewLineComment(v)),
		].filter((n) => !!n);

		const newAst = t.program(body);

		const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

		const rawVue = generateVue(desc, code);

		const format = await formatCode(rawVue);

		return {
			isOk: true,
			content: format,
			errors: [],
		};
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
