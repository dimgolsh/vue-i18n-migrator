import { findInDir } from '../utils';
import { convertSingleFile } from './convert-single';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

export const convertFolder = async (folderPath: string) => {
	try {
		const files = findInDir(folderPath);

		if (files.length === 0) {
			console.warn(chalk.yellow('⚠ No Vue files found in the directory'));
			return;
		}
		let value = 0;

		const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
		bar.start(files.length, 0);
		const resultAll = { success: 0, err: 0 };

		for (const filePath of files) {
			value++;
			try {
				const result = await convertSingleFile(filePath, null);

				if (result) {
					resultAll.success++;
				} else {
					resultAll.err++;
				}
			} catch (e) {
				resultAll.err++;
			}
			bar.update(value);
		}
		bar.stop();
		console.log(chalk.green('✔ Conversion completed.'));
		console.log(chalk.green(`✔ Successfully converted ${resultAll.success} files`));
		if (resultAll.err) {
			console.log(chalk.yellow(`⚠ ${resultAll.err} files could not be converted`));
		}
	} catch (e) {
		console.error(chalk.red(`✖ Error converting files in directory: ${(e as Error).message}`));
	}
};
