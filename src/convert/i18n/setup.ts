import * as t from '@babel/types';
import { processDefineOptions } from '../setup/defineOptions';
import { importsCheck } from '../imports';
import { ParseResult } from '@babel/parser';
import { processUseI18n } from '../use-i18n';
import { wrapNewLineComment } from '../utils';

export const convertSetupI18n = (ast: ParseResult<t.File>, template: string): t.Statement[] => {
	let setupContent: t.Statement[] = [];
	const imports: t.ImportDeclaration[] = [];

	// Check if the import declaration is a useI18n import
	importsCheck(ast, imports);

	// Process the define options - i.e. defineOptions({ i18n })
	processDefineOptions(ast);

	// Process the use-i18n - i.e. const { t } = useI18n()
	processUseI18n(ast, setupContent, template);

	const newImports = [...imports, ...ast.program.body.filter((node) => t.isImportDeclaration(node))];

	const otherBody = ast.program.body.filter((node) => !t.isImportDeclaration(node));

	const body: t.Statement[] = [
		...newImports,
		...otherBody.map(wrapNewLineComment),
		...setupContent.map((node) => wrapNewLineComment(node)),
	];

	return body;
};
