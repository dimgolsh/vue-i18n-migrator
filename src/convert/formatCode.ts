import * as prettier from 'prettier/standalone';
import * as html from 'prettier/plugins/html';

export const formatCode = async (rawVueCode: string) => {
	const formattedCode = await prettier.format(rawVueCode, {
		parser: 'vue',
		plugins: [html],
		// From config
		singleQuote: true,
		printWidth: 120,
		useTabs: true,
		endOfLine: 'crlf',
		quoteProps: 'consistent',
		bracketSpacing: true,
		bracketSameLine: false,
		trailingComma: 'all',
		htmlWhitespaceSensitivity: 'strict',

		vueIndentScriptAndStyle: true,
		singleAttributePerLine: true,
	});

	return formattedCode;
};
