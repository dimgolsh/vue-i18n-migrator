import { parse } from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { parseVueFromContent } from './utils';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { convertSetupI18n } from './i18n/setup';
import { BlockOrder, ConvertResult, ConvertOptions } from './types';
import { convertCompositionI18n } from './i18n/composition';
import { validateFileOnCorrect } from './validateFile';

export const convert = async (content: string, options?: ConvertOptions): Promise<ConvertResult> => {
	try {
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

		const errors = validateFileOnCorrect(ast, templateContent, !isScriptSetup, options);

		if (errors.length === 0) {
			return {
				isOk: false,
				content: `// ⚠ Vue file is already converted \n\n ${content}`,
				errors: ['⚠ Vue file is already converted'],
			};
		}

		const body = isScriptSetup ? convertSetupI18n(ast, templateContent, options) : convertCompositionI18n(ast, templateContent, options);

		// Create a new AST with the converted code
		const newAst = t.program(body);

		// Generate the code
		const code = generate(newAst, {
			jsescOption: { quotes: 'single' },
		}).code;

		// Generate the Vue code
		const rawVue = generateVue(
			desc,
			code,
			isScriptSetup ? BlockOrder.SetupTemplateStyle : BlockOrder.TemplateSetupStyle,
			isScriptSetup,
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
