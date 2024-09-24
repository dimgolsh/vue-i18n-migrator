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
