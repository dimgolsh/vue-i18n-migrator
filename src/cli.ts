#!/usr/bin/env node

import { Command } from 'commander';
import { readFile, writeFile } from './utils';
import { convert } from './convert';
// import chalk from 'chalk';

const program = new Command();

program.version('1.0.0').description('Vue Composition API to Script Setup Converter');

program
	.command('convert <filepath>')
	.description('Convert a single Vue file to script setup')
	.action(async (filepath: string) => {
		try {
			const content = await readFile(filepath);
			const converted = await convert(content); // Конвертация

			if (converted) {
				await writeFile(filepath, converted);
				console.log(`✔ Successfully converted file: ${filepath}`);
				// console.log(chalk.green(`✔ Successfully converted file: ${filepath}`));
			} else {
				console.warn(`⚠ No changes made to file: ${filepath}`);
				// console.warn(chalk.yellow(`⚠ No changes made to file: ${filepath}`));
			}
		} catch (error) {
			console.error(`✖ Error converting file: ${(error as Error).message}`);
			// console.error(chalk.red(`✖ Error converting file: ${(error as Error).message}`));
		}
	});

program.parse(process.argv);
