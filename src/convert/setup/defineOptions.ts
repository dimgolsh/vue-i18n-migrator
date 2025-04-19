import * as t from '@babel/types';
import traverse from '@babel/traverse';

//** Process defineOptions to remove i18n property
// If defineOptions has only name property after i18n removal, keep it
// If defineOptions has i18n property and no name property, remove defineOptions completely
export const processDefineOptions = (ast: t.Node) => {
	traverse(ast, {
		ExpressionStatement(path) {
			if (!t.isCallExpression(path.node.expression)) {
				return;
			}

			if (!t.isIdentifier(path.node.expression.callee) || path.node.expression.callee.name !== 'defineOptions') {
				return;
			}

			const args = path.node.expression.arguments;

			if (args.length === 0 || !t.isObjectExpression(args[0])) {
				return;
			}
			const properties = args[0].properties;

			const findI18n = (prop: t.ObjectProperty) => {
				return t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'i18n';
			};

			const hasI18n = properties.some((prop): prop is t.ObjectProperty => findI18n(prop as t.ObjectProperty));

			if (!hasI18n) {
				return;
			}

			if (hasI18n && properties.length === 1) {
				path.remove();
				return;
			} else {
				path.replaceWith(
					t.callExpression(t.identifier('defineOptions'), [
						t.objectExpression(properties.filter((prop) => !findI18n(prop as t.ObjectProperty))),
					]),
				);
			}
		},
	});
};
