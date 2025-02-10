import { getDefineComponent, parseVueFromContent } from '../../utils';

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { getDefineOptions } from '../../defineOptions';
import { ConvertResult } from '../../../convert/types';

export const checkComposition = async (content: string): Promise<ConvertResult> => {
	const desc = parseVueFromContent(content);

	if (desc.scriptSetup) {
		return {
			isOk: true,
			content: '',
			errors: [],
		};
	}

	if (!desc.script) {
		return {
			isOk: true,
			content: '',
			errors: [],
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

	if (defineOptionsNode) {
		return {
			isOk: false,
			content: '',
			errors: [],
		};
	}

	return {
		isOk: true,
		content: '',
		errors: [],
	};
};
