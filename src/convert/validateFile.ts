import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import { hasI18nImport } from './imports';
import { checkI18nUsage } from './template';
import { findExistingI18n } from './use-i18n';
import { processBlockStatement } from './composition/blockStatement';
import { convertDefineComponent } from './composition/defineComponent';
import { processDefineOptions } from './setup/defineOptions';
import { ConvertOptions } from './types';

export const validateFile = (ast: ParseResult<t.File>, template: string) => {
	const errors: string[] = [];

	if (!hasI18nImport(ast)) {
		errors.push('⚠ Vue file must contain an i18n import');
	}

	const existingI18n = findExistingI18n(ast);

	if (existingI18n) {
		if (!existingI18n.hasI18nMessage) {
			errors.push('⚠ Vue file must not contain i18n usage');
		}
	}

	if (template) {
		const i18nUsage = checkI18nUsage(template);

		if (i18nUsage.t || i18nUsage.tc || i18nUsage.n || i18nUsage.d) {
			errors.push('⚠ Vue file must not contain i18n usage');
		}
	}

	return errors;
};

export const validateFileOnCorrect = (
	ast: ParseResult<t.File>,
	template: string,
	isComposition: boolean = false,
	options?: ConvertOptions,
) => {
	const errors: string[] = [];

	if (!hasI18nImport(ast)) {
		return errors;
	}

	const existingI18n = findExistingI18n(ast);
	const i18nUsage = checkI18nUsage(template);
	const processBlockStatementResult = processBlockStatement(ast, template, false);
	const templateKeys = i18nUsage.templateKeys;

	if (i18nUsage.t || i18nUsage.tc || i18nUsage.n || i18nUsage.d) {
		errors.push('⚠ Vue file template contain deprecated i18n usage');
	}

	if (isComposition) {
		const defineComponentResult = convertDefineComponent(ast, template, false, options);

		if (templateKeys.length) {
			const isCorrect = templateKeys.every((name) =>
				processBlockStatementResult.returnObjectPropertiesNames.includes(name),
			);

			if (!isCorrect) {
				errors.push('⚠ return object should has t, n or d property');
			}
		}

		if (defineComponentResult) {
			errors.push("⚠ Vue file don't should has i18n property in defineComponent");
		}
	} else {
		const hasI18nInDefineOptions = processDefineOptions(ast, template, options);

		if (hasI18nInDefineOptions) {
			errors.push('⚠ Vue file should not has i18n property in defineOptions');
		}
	}

	if (existingI18n) {
		if (!existingI18n.hasI18nMessage) {
			errors.push('⚠ useI18n(i18n) should has message property');
		}

		if (templateKeys.length) {
			if (!templateKeys.filter((key) => key !== 'i18nT').every((arg) => existingI18n.argumentsNames.includes(arg))) {
				errors.push('⚠ useI18n(i18n) should has correct arguments');
			}
		}
	} else {
		if (templateKeys.length > 0) {
			errors.push('⚠ Vue file should has useI18n(i18n)');
		}
	}

	return errors;
};
