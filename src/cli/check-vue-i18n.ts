import { existsFileSync, findInDir, getFullPath, isVueFile, readFile } from '../utils';
import chalk from 'chalk';
import { checkVueI18nFromContent } from '../convert/utils/checkVueI18n';
import cliProgress from 'cli-progress';

export const checkVueI18nFile = async (filepath: string) => {
	try {
		if (!isVueFile(filepath)) {
			return true;
		}

		const path = getFullPath(filepath);

		if (!existsFileSync(path)) {
			console.warn(chalk.yellow(`⚠ File not found: ${filepath}`));
			return true;
		}

		const fileContent = await readFile(filepath);

		const result = await checkVueI18nFromContent(fileContent);

		if (!result.isOk) {
			console.log(chalk.red(`✖ File is not correct syntax for Vue I18n: ${filepath}\n${result.errors.join('\n')}\n--------------------------------`));
			return false;
		} else {
			console.log(chalk.green(`✅ File is correct syntax for Vue I18n: ${filepath}`));
		}

		return true;
	} catch (error) {
		console.error(error);
		return true;
	}
};

export const checkVueI18nForFiles = async (filepaths: string[]) => {
	const results = await Promise.all(filepaths.map((filepath) => checkVueI18nFile(filepath)));

	if (results.some((result) => !result)) {
		console.log(chalk.red(`✖ Some files are not correct syntax for Vue I18n`));

		throw new Error('Vue I18n is not correct syntax');
	}

	return true;
};


export const checkVueI18nFolder = async (folderPath: string) => {
	try {
		const start = performance.now();
		const files = findInDir(folderPath);

		if (files.length === 0) {
			console.warn(chalk.yellow('⚠ No Vue files found in the directory'));
			return;
		}
		let value = 0;

		const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
		bar.start(files.length, 0);
		const resultAll = { success: 0, err: 0 };
		const errors: string[] = [];
	

		for (const filePath of files) {
			value++;
			try {
				const fileContent = await readFile(filePath);
				const result = await checkVueI18nFromContent(fileContent);

				if (result.isOk) {
					resultAll.success++;
				} else {
					resultAll.err++;
					errors.push(`✖ ${filePath}\n${result.errors.join('\n')}\n--------------------------------`);
				}
			} catch (e) {
				resultAll.err++;
			}
			bar.update(value);
		}
		bar.stop();

		const stop = performance.now();
		const inSeconds = (stop - start) / 1000;
		const rounded = Number(inSeconds).toFixed(3);

		if (resultAll.success) {
			console.log(chalk.green(`✔ Correct syntax for Vue I18n: ${resultAll.success} files in ${rounded}s.`));
		}

		if (resultAll.err) {
			console.log(chalk.yellow(`⚠ ${resultAll.err} files contain errors`));
			console.log(chalk.yellow(errors.join('\n')));
		}
	} catch (e) {
		console.error(chalk.red(`✖ Error checking files in directory: ${(e as Error)?.message}`));
	}
};
