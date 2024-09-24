import { parse } from '@babel/parser';

import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { getDefineComponent, parseVueFromContent, wrapNewLineComment } from './utils';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { getDefineEmit } from './defineEmits';
import { getImports } from './imports';
import { getDefineOptions } from './defineOptions';
import { getDefineProps } from './defineProps';
import { getSetupContent } from './setup';

export const convert = async (content: string) => {
	try {
		const desc = parseVueFromContent(content);

		if (desc.scriptSetup) {
			console.warn('File is already setup');
			return null;
		}

		if (desc.script.lang !== 'ts') {
			console.warn('Vue file is not typescript');
			return null;
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

		const imports = getImports(ast);

		const body: t.Statement[] = [
			...imports,
			wrapNewLineComment(defineOptionsNode),
			wrapNewLineComment(props),
			wrapNewLineComment(emits),
			...setupContent.map((v) => wrapNewLineComment(v)),
		].filter((n) => !!n);

		const newAst = t.program(body);

		const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

		const rawVue = generateVue(desc, code);

		const format = await formatCode(rawVue);

		return format;
	} catch (e) {
		console.log(e);
		console.error('Failed to convert');
		return null;
	}
};
