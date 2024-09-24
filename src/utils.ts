import fs from 'fs';
import * as path from 'node:path';

export const isVueFile = (path: string): boolean => {
	return path.endsWith('.vue');
};

export const readFile = (filePath: string) => {
	const fullPath = path.resolve(filePath);
	return fs.readFileSync(fullPath, 'utf8');
};

export const writeFile = async (filePath: string, content: string) => {
	fs.writeFileSync(filePath, content, 'utf-8');
};
