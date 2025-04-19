import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';
import { importsCheck } from '../imports';
import { convertDefineComponent } from '../composition/defineComponent';
import { processBlockStatement } from '../composition/blockStatement';
import { wrapNewLineComment } from '../utils';

export const convertCompositionI18n = (ast: ParseResult<t.File>, template: string): t.Statement[] => {
	// let setupContent: t.Statement[] = [];
	const imports: t.ImportDeclaration[] = [];

	// Check if the import declaration is a useI18n import
	importsCheck(ast, imports);

	// Remove i18n from defineComponent
	convertDefineComponent(ast);

	// Process the block statement
	processBlockStatement(ast, template);

	const body: t.Statement[] = [...imports, ...ast.program.body.map(wrapNewLineComment)];

	return body;
};
