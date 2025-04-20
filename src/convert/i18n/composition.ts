import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';
import { importsCheck } from '../imports';
import { convertDefineComponent } from '../composition/defineComponent';
import { processBlockStatement } from '../composition/blockStatement';
import { wrapNewLineComment } from '../utils';
import { ConvertOptions } from '../types';

export const convertCompositionI18n = (
	ast: ParseResult<t.File>,
	template: string,
	options?: ConvertOptions,
): t.Statement[] => {
	// let setupContent: t.Statement[] = [];
	const imports: t.ImportDeclaration[] = [];

	// Check if the import declaration is a useI18n import
	importsCheck(ast, imports);

	// Remove i18n from defineComponent
	convertDefineComponent(ast, template, true, options);

	// Process the block statement
	processBlockStatement(ast, template);

	const newImports = [...imports, ...ast.program.body.filter((node) => t.isImportDeclaration(node))];

	const body: t.Statement[] = [
		...newImports,
		...ast.program.body.filter((node) => !t.isImportDeclaration(node)).map(wrapNewLineComment),
	];

	return body;
};
