import * as t from '@babel/types';
import { parse as parseVue, SFCDescriptor } from '@vue/compiler-sfc';
import { NodePath } from '@babel/traverse';

export const newLine = 'REPLACE_FOR_NEW_LINE';

export const parseVueFromContent = (
	content: string,
): { isOk: boolean; descriptor: SFCDescriptor; errors: string[] } => {
	const { descriptor, errors } = parseVue(content);

	if (errors.length > 0) {
		return { isOk: false, descriptor: null, errors: errors.map((error) => error?.message) };
	}

	return { isOk: true, descriptor, errors: [] };
};

export const isSFC = (content: string) => {
	try {
		parseVueFromContent(content);
		return true;
	} catch (e) {
		return false;
	}
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
		// setup() {}
		if (t.isObjectMethod(prop) && t.isIdentifier(prop.key) && prop.key.name === 'setup') {
			return prop;
		}
		// setup: () => {}
		if (
			t.isObjectProperty(prop) &&
			t.isIdentifier(prop.key) &&
			prop.key.name === 'setup' &&
			t.isArrowFunctionExpression(prop.value)
		) {
			const value = prop.value;
			if (t.isBlockStatement(value.body)) {
				return t.objectMethod('method', t.identifier('setup'), value.params, value.body);
			}
		}
	}

	return null;
};

export const extractSetupParams = (node: t.ObjectMethod) => {
	const params = node.params;

	const result: {
		props?: t.Identifier;
		emit?: t.ObjectProperty;
		slots?: t.ObjectProperty;
		attrs?: t.ObjectProperty;
	} = {
		props: null,
		emit: null,
		slots: null,
		attrs: null,
	};

	params.forEach((prop) => {
		if (t.is('Identifier', prop)) {
			if (prop.name === 'props') {
				result.props = prop;
			}
		}

		if (t.isObjectPattern(prop)) {
			const emit = getProperty(prop.properties, 'emit');
			const slots = getProperty(prop.properties, 'slots');
			const attrs = getProperty(prop.properties, 'attrs');

			if (emit) {
				result.emit = emit;
			}
			if (slots) {
				result.slots = slots;
			}
			if (attrs) {
				result.attrs = attrs;
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
