import * as t from '@babel/types';
import { parse as parseVue } from '@vue/compiler-sfc';
import { NodePath } from '@babel/traverse';

export const newLine = 'REPLACE_FOR_NEW_LINE';

export const parseVueFromContent = (content: string) => {
	const { descriptor, errors } = parseVue(content);
	if (errors.length > 0) {
		throw new Error(errors.join('\n'));
	}
	return descriptor;
};

export const getDefineComponent = (path: NodePath<t.ExportDefaultDeclaration>): t.ObjectExpression => {
	// export default {
	// 	name: 'MyComponent',

	if (t.isExportDefaultDeclaration(path.node) && t.isObjectExpression(path.node.declaration)) {
		return path.node.declaration;
	}

	// defineComponent
	if (
		t.isExportDefaultDeclaration(path.node) &&
		t.isCallExpression(path.node.declaration) &&
		t.isIdentifier(path.node.declaration.callee)
	) {
		const isDefineComponent = path.node.declaration.callee.name === 'defineComponent';
		if (isDefineComponent && t.isObjectExpression(path.node.declaration.arguments[0])) {
			return path.node.declaration.arguments[0];
		}
		return null;
	}
	return null;
};

export const getProperty = (properties: t.Node[] | t.Node, keyName: string) => {
	if (!Array.isArray(properties)) return null;

	for (const prop of properties) {
		if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === keyName) {
			return prop;
		}
	}

	return null;
};

export const getSetup = (properties: t.Node[] | t.Node) => {
	if (!Array.isArray(properties)) return null;

	for (const prop of properties) {
		if (t.isObjectMethod(prop) && t.isIdentifier(prop.key) && prop.key.name === 'setup') {
			return prop;
		}
	}

	return null;
};

export const extractSetupParams = (node: t.ObjectMethod) => {
	const params = node.params;

	const result: { props?: t.Identifier; emit?: t.ObjectProperty } = {
		props: null,
		emit: null,
	};

	params.forEach((prop) => {
		if (t.is('Identifier', prop)) {
			if (prop.name === 'props') {
				result.props = prop;
			}
		}

		if (t.isObjectPattern(prop)) {
			const emit = getProperty(prop.properties, 'emit');

			if (emit) {
				result.emit = emit;
			}
		}
	});

	return result;
};

export const wrapNewLineComment = (
	node: t.VariableDeclaration | t.ExpressionStatement | t.Statement | t.BlockStatement,
) => {
	if (!node) {
		return null;
	}
	node.leadingComments = [{ type: 'CommentLine', value: newLine }];
	return node;
};
