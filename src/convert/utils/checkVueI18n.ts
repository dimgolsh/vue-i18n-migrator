import { ConvertResult } from '../types';
import { parseVueFromContent } from '../utils';
import { validateFileOnCorrect } from '../validateFile';
import { parse } from '@babel/parser';

export const checkVueI18nFromContent = async (content: string): Promise<ConvertResult> => {
	const desc = parseVueFromContent(content);

	if (!desc.script && !desc.scriptSetup) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ Vue file must contain either script or script setup'],
		};
	}

	const isScriptSetup = !!desc.scriptSetup;
	const scriptContent = isScriptSetup ? desc.scriptSetup.content : desc.script.content;
	const templateContent = desc.template?.content;

	const ast = parse(scriptContent, {
		sourceType: 'module',
		plugins: ['typescript'],
	});

	const errors = validateFileOnCorrect(ast, templateContent, !isScriptSetup);

	if (errors.length === 0) {
		return {
			isOk: true,
			content,
			errors: [],
		};
	}

	return {
		isOk: false,
		content: '',
		errors,
	};
};
