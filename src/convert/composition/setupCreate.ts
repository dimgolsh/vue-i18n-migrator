import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';
import { checkI18nUsage } from '../template';

export const setupCreate = (ast: t.Node, template: string) => {
	const i18nUsage = checkI18nUsage(template);

	const empty = i18nUsage.templateKeys.length === 0;

	if (empty) {
		return;
	}

	traverse(ast, {
		ObjectExpression(path: NodePath<t.ObjectExpression>) {
			if (!t.isCallExpression(path.parent)) {
				return;
			}

			if (t.isIdentifier(path.parent.callee) && path.parent.callee.name !== 'defineComponent') {
				return;
			}

			const properties = path.node.properties.filter(
				(property) => t.isObjectMethod(property) || t.isObjectProperty(property),
			);

			if (properties.some((property) => t.isIdentifier(property.key) && property.key.name === 'setup')) {
				return;
			}

			const setup = t.objectMethod(
				'method',
				t.identifier('setup'),
				[],
				t.blockStatement([t.returnStatement(t.objectExpression([]))]),
				false,
			);

			path.node.properties.push(setup);
		},
	});
};
