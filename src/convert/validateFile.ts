import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import { hasI18nImport } from './imports';
import { checkI18nUsage } from './template';
import { findExistingI18n } from './use-i18n';
import { processBlockStatement } from './composition/blockStatement';
import { convertDefineComponent } from './composition/defineComponent';

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

export const validateFileOnCorrect = (ast: ParseResult<t.File>, template: string, isComposition: boolean = false) => {
	const errors: string[] = [];

	if (!hasI18nImport(ast)) {
		return errors;
	}

	const existingI18n = findExistingI18n(ast);
	const i18nUsage = checkI18nUsage(template);
	const processBlockStatementResult = processBlockStatement(ast, template, false);
	const templateKeys = Object.entries(i18nUsage)
		.filter(([_key, value]) => value)
		.map(([key]) => key);

	if (i18nUsage.t || i18nUsage.tc || i18nUsage.n || i18nUsage.d) {
		errors.push('⚠ Vue file template contain deprecated i18n usage');
	}

	if (isComposition) {
		const defineComponentResult = convertDefineComponent(ast, false);

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
	}

	if (existingI18n) {
		if (!existingI18n.hasI18nMessage) {
			errors.push('⚠ useI18n(i18n) should has message property');
		}

		if (templateKeys.length) {
			if (!templateKeys.every((arg) => existingI18n.argumentsNames.includes(arg))) {
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
