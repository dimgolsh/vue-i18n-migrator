import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { extractSetupParams, getProperty, getSetup } from '@/convert/utils';
import { ParseResult } from '@babel/parser';

const findEmits = (ast: ParseResult<t.File>) => {
	const emits = new Set<string>();

	traverse(ast, {
		CallExpression(path) {
			const callee = path.node.callee;
			if (t.isIdentifier(callee) && callee.name === 'emit') {
				const args = path.node.arguments;
				if (args.length && t.isStringLiteral(args[0])) {
					emits.add(args[0].value);
				}
			}
		},
	});

	return Array.from(emits);
};

export const getDefineEmit = (path: t.ObjectExpression, ast: ParseResult<t.File>) => {
	const properties = path.properties;

	const emitsProperty = getProperty(properties, 'emits');
	if (emitsProperty) {
		const callExpression = t.callExpression(t.identifier('defineEmits'), [emitsProperty.value as t.Expression]);

		const setup = getSetup(properties);
		if (!setup) {
			return t.expressionStatement(callExpression);
		}

		const params = extractSetupParams(setup);
		if (params.emit) {
			return t.variableDeclaration('const', [t.variableDeclarator(t.identifier('emit'), callExpression)]);
		}
		return t.expressionStatement(callExpression);
	}

	const emits = findEmits(ast);

	if (emits.length === 0) {
		return null;
	}

	return t.variableDeclaration('const', [
		t.variableDeclarator(
			t.identifier('emit'),
			t.callExpression(t.identifier('defineEmits'), [t.arrayExpression(emits.map((event) => t.stringLiteral(event)))]),
		),
	]);
};
