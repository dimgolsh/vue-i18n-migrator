import traverse from '@babel/traverse';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';

export const getImports = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		ImportDeclaration(node) {
			if (node.node.specifiers.length === 0) {
				node.remove();
			}
		},
	});

	const imports = ast.program.body.filter((n) => t.isImportDeclaration(n));

	return imports;
};

//** Create an i18n import declaration
// i.e. import { useI18n } from 'vue-i18n'
export const createI18nImport = (): t.ImportDeclaration => {
	return t.importDeclaration(
		[t.importSpecifier(t.identifier('useI18n'), t.identifier('useI18n'))],
		t.stringLiteral('vue-i18n'),
	);
};

//** Check if the import declaration is a useI18n import
// i.e. import { useI18n } from 'vue-i18n'
export const hasUseI18nImport = (node: t.ImportDeclaration): boolean => {
	if (!t.isImportDeclaration(node)) {
		return false;
	}

	return node.specifiers.some(
		(spec) => t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) && spec.imported.name === 'useI18n',
	);
};

//** Check if the import declaration is a useI18n import
// i.e. import { useI18n } from 'vue-i18n'
export const importsCheck = (ast: ParseResult<t.File>, imports: t.ImportDeclaration[]) => {
	const existingImports = getImports(ast);

	const isHasUseI18nImport = existingImports.some((importDeclaration) => hasUseI18nImport(importDeclaration));

	if (!isHasUseI18nImport) {
		imports.push(createI18nImport());
	}
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

// Check if the import declaration is an i18n import
// i.e. import i18n from './i18n'
export const findI18nImport = (node: t.ImportDeclaration): boolean => {
	const specifiers = node.specifiers;

	if (specifiers.length === 0) {
		return false;
	}

	const [specifier] = specifiers;

	if (!t.isImportDefaultSpecifier(specifier)) {
		return false;
	}

	const imported = specifier.local;

	if (!t.isIdentifier(imported)) {
		return false;
	}

	return imported.name === 'i18n';
};

// Check if the import declaration is an i18n import
// i.e. import i18n from './i18n'
export const hasI18nImport = (ast: ParseResult<t.File>): boolean => {
	const existingImports = getImports(ast);

	return existingImports.some((importDeclaration) => findI18nImport(importDeclaration));
};
