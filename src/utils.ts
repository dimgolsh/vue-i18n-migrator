
import { parse as parseVue } from '@vue/compiler-sfc';
import fs from "node:fs/promises";


export const isVueFile = (path: string): boolean => {
	return path.endsWith('.vue');
};

export const readFile = (filePath: string) => {
	return fs.readFile(filePath, { encoding: 'utf8' });
};

export const writeFile = async (filePath: string, content: string) => {
	fs.writeFile(filePath, content, 'utf-8');
};

export const parseVueFromContent = (content: string) => {
	const { descriptor, errors } = parseVue(content);
	if (errors.length > 0) {
		throw new Error(errors.join('\n'));
	}
	return descriptor;
};

export const parseFileVue = async (filePath: string) => {
	const content = await readFile(filePath);
	return parseVueFromContent(content);
};
