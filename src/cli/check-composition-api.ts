import { existsFileSync, getFullPath, isVueFile, readFile } from '../utils';
import chalk from 'chalk';
import { checkComposition } from '../convert/utils/checkComposition';

export const checkCompositionApiFile = async (filepath: string) => {
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

		const result = await checkComposition(fileContent);

		if (!result.isOk) {
			console.log(chalk.red(`✖ File is not setup: ${filepath}`));
			return false;
		}

		return true;
	} catch (error) {
		console.error(error);
		return true;
	}
};

export const checkCompositionApi = async (filepaths: string[]) => {
	const results = await Promise.all(filepaths.map((filepath) => checkCompositionApiFile(filepath)));

	if (results.some((result) => !result)) {
		console.log(chalk.red(`✖ Some files are not setup`));

		throw new Error('Composition API is not supported');
	}

	return true;
};
