import * as prettier from 'prettier/standalone';
import * as html from 'prettier/plugins/html';
import * as babel from 'prettier/plugins/babel';
import * as typescript from 'prettier/plugins/typescript';
import estree from 'prettier/plugins/estree';

import { defaultPrettierConfig } from '../config';
// import chalk from 'chalk';

export const formatCode = async (rawVueCode: string) => {
	try {
		return await prettier.format(rawVueCode, {
			parser: 'vue',
			plugins: [html, babel, typescript, estree],
			// From config
			...defaultPrettierConfig,
		});
	} catch (_e) {
		// console.log(chalk.red('✖ Error formatting file'));
		// console.log(e);
		return rawVueCode;
	}
};
