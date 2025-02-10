#!/usr/bin/env node

import { Command } from 'commander';
import { convertSingleFile } from './cli/convert-single';
import { convertFolder } from './cli/convert-folder';
import { ConvertFileOptions } from './convert/types';
import { checkCompositionApi } from './cli/check-composition-api';
const program = new Command();

program
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	.version((require('../package.json') as { version: string }).version)
	.description('Vue Composition API to Script Setup Converter')
	.usage('<command> [options]');

program
	.command('single <filepath>')
	.description('Convert a single Vue file to script setup')
	.option('-v, --view', 'Preview changes in the editor')
	.option('--propsOptionsLike', 'Convert props to defineProps with propsOptionsLike')
	.action((filepath: string, options: ConvertFileOptions) => {
		convertSingleFile(filepath, options);
	});

program
	.command('folder <filePath>')
	.description('Convert folder vue files to script setup')
	.option('-v, --view', 'Preview changes in the editor')
	.option('--propsOptionsLike', 'Convert props to defineProps with propsOptionsLike')
	.action((filepath: string, options: ConvertFileOptions) => {
		convertFolder(filepath, options);
	});

program
	.command('check-composition-api <filepath>')
	.description('Check if the file is using the Composition API')
	.action((filepath: string) => {
		checkCompositionApi([filepath]);
	});

program.parse(process.argv);
