#!/usr/bin/env node

import { Command } from 'commander';
import { convertSingleFile } from './cli/convert-single';
import { convertFolder } from './cli/convert-folder';

const program = new Command();

program.version('1.0.0').description('Vue Composition API to Script Setup Converter');

program
	.command('single <filepath>')
	.description('Convert a single Vue file to script setup')
	.option('-v, --view', 'Preview changes in the editor')
	.action((filepath: string, options: Record<string, any>) => {
		convertSingleFile(filepath, options);
	});

program
	.command('folder <filePath>')
	.description('Convert folder vue files to script setup')
	.action((filepath: string) => {
		convertFolder(filepath);
	});

program.parse(process.argv);
