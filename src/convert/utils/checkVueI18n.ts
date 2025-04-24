import { ConvertOptions, ConvertResult } from '../types';
import { parseVueFromContent } from '../utils';
import { validateFileOnCorrect } from '../validateFile';
import { parse } from '@babel/parser';
import { checkI18nUsage } from '../template';

export const checkVueI18nFromContent = async (content: string, options?: ConvertOptions): Promise<ConvertResult> => {
	const desc = parseVueFromContent(content);

	if (!desc.isOk) {
		return {
			isOk: false,
			content: '',
			errors: desc.errors,
		};
	}

	const { descriptor } = desc;
	const templateContent = descriptor?.template?.content;
	const i18nUsage = checkI18nUsage(templateContent);

	// skip if no script and no script setup and no i18n usage in template
	if (!descriptor.script && !descriptor.scriptSetup && i18nUsage.templateKeys.length === 0) {
		return {
			isOk: true,
			content: '',
			errors: [],
		};
	}

	// error if no script and no script setup and i18n usage in template
	if (!descriptor.script && !descriptor.scriptSetup && i18nUsage.templateKeys.length > 0) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ Vue file must contain either script or script setup'],
		};
	}

	const isScriptSetup = !!descriptor.scriptSetup;
	const scriptContent = isScriptSetup ? descriptor.scriptSetup.content : descriptor.script.content;

	const ast = parse(scriptContent, {
		sourceType: 'module',
		plugins: ['typescript'],
	});

	const errors = validateFileOnCorrect(ast, templateContent, !isScriptSetup, options);

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
