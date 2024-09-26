import traverse from '@babel/traverse';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';

export const getImports = (ast: ParseResult<t.File>) => {
	const newImports: t.ImportDeclaration[] = [];

	traverse(ast, {
		ImportDeclaration(path) {
			const source = path.node.source.value;
			if (source === 'vue') {
				const filteredSpecifiers = path.node.specifiers.filter(
					(specifier) => specifier.local.name !== 'defineComponent',
				);

				if (filteredSpecifiers.length > 0) {
					newImports.push(t.importDeclaration(filteredSpecifiers, t.stringLiteral('vue')));
				}
			} else {
				newImports.push(path.node); // Сохраняем остальные импорты
			}
		},
	});

	return newImports;
};

export const addImport = (imports: t.ImportDeclaration[], value: { source: string; specifier: string }) => {
	const findImport = imports.findIndex((importDeclaration) => {
		return importDeclaration.source.value === value.source;
	});

	if (findImport === -1) {
		imports.push(
			t.importDeclaration(
				[t.importSpecifier(t.identifier(value.specifier), t.identifier(value.specifier))],
				t.stringLiteral(value.source),
			),
		);
	} else {
		imports[findImport].specifiers.push(t.importDefaultSpecifier(t.identifier(value.specifier)));
	}

	return imports;
};
