#!/usr/bin/env node

import { Command } from 'commander';
import { convertSingleFile } from './cli/convert-single';
import { convertFolder } from './cli/convert-folder';
import { ConvertFileOptions } from './convert/types';
import { checkVueI18nFile, checkVueI18nFolder } from './cli/check-vue-i18n';

const program = new Command();

program
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	.version((require('../package.json') as { version: string }).version)
	.description('Vue i18n Migrator')
	.usage('<command> [options]');

program
	.command('single <filepath>')
	.description('Convert a single Vue file to new i18n syntax')
	.option('-v, --view', 'Preview changes in the editor')
	.action((filepath: string, options: ConvertFileOptions) => {
		convertSingleFile(filepath, options);
	});

program
	.command('folder <filePath>')
	.description('Convert folder vue files to new i18n syntax')
	.option('-v, --view', 'Preview changes in the editor')
	.action((filepath: string, options: ConvertFileOptions) => {
		convertFolder(filepath, options);
	});

program
	.command('check-vue-i18n <filepath>')
	.description('Check if the file is using the Vue i18n')
	.action((filepath: string) => {
		checkVueI18nFile(filepath);
	});

program
	.command('check-vue-i18n-folder <folderpath>')
	.description('Check if the folder is using the Vue i18n')
	.action((folderpath: string) => {
		checkVueI18nFolder(folderpath);
	});

program.parse(process.argv);
