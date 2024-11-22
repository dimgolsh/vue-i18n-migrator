import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { extractSetupParams, getProperty, getSetup } from './utils';
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

const createEmitProperty = (name: string) => {
	const ident = t.identifier('e');
	ident.typeAnnotation = t.tsTypeAnnotation(t.tsLiteralType(t.stringLiteral(name)));
	return t.tsCallSignatureDeclaration(null, [ident], t.tSTypeAnnotation(t.tsVoidKeyword()));
};

const convertEmits = (node: t.ArrayExpression) => {
	const params: t.TSCallSignatureDeclaration[] = [];
	const callExpression = t.callExpression(t.identifier('defineEmits'), []);

	for (const el of node.elements) {
		if (t.isStringLiteral(el)) {
			params.push(createEmitProperty(el.value));
		}
	}
	callExpression.typeParameters = t.tsTypeParameterInstantiation([t.tsTypeLiteral(params)]);

	return callExpression;
};

export const getDefineEmit = (path: t.ObjectExpression, ast: ParseResult<t.File>) => {
	const properties = path.properties;

	const emitsProperty = getProperty(properties, 'emits');

	if (emitsProperty) {
		const callExpression = convertEmits(emitsProperty.value as t.ArrayExpression);

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

	const exp = t.arrayExpression(emits.map((event) => t.stringLiteral(event)));

	const call = convertEmits(exp);

	return t.variableDeclaration('const', [t.variableDeclarator(t.identifier('emit'), call)]);
};
