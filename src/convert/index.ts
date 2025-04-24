import { parse } from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { parseVueFromContent } from './utils';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { convertSetupI18n } from './i18n/setup';
import { BlockOrder, ConvertResult, ConvertOptions, ConvertError } from './types';
import { convertCompositionI18n } from './i18n/composition';
import { validateFileOnCorrect } from './validateFile';
import { checkI18nUsage } from './template';

export const convert = async (content: string, options?: ConvertOptions): Promise<ConvertResult> => {
	try {
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
				isOk: false,
				content: '',
				errors: [ConvertError.AlreadyConverted],
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

		const hasAdditionalScript = isScriptSetup && descriptor?.script?.content;
		const additionalScriptContent = hasAdditionalScript ? descriptor.script.content : '';

		const ast = parse(scriptContent, {
			sourceType: 'module',
			plugins: ['typescript'],
		});

		const errors = validateFileOnCorrect(ast, templateContent, !isScriptSetup, options);

		if (errors.length === 0) {
			return {
				isOk: false,
				content: `// ⚠ Vue file is already converted \n\n ${content}`,
				errors: [ConvertError.AlreadyConverted],
			};
		}

		const body = isScriptSetup
			? convertSetupI18n(ast, templateContent, options)
			: convertCompositionI18n(ast, templateContent, options);

		// Create a new AST with the converted code
		const newAst = t.program(body);

		// Generate the code
		const code = generate(newAst, {
			jsescOption: { quotes: 'single' },
		}).code;

		// Generate the Vue code
		const rawVue = generateVue(
			descriptor,
			code,
			isScriptSetup ? BlockOrder.SetupTemplateStyle : BlockOrder.TemplateSetupStyle,
			isScriptSetup,
			additionalScriptContent,
		);

		// Format the code
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
