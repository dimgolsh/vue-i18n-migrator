import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { filterUniqueArgs, processUseI18n } from '../use-i18n';
import { wrapNewLineComment } from '../utils';

export const processBlockStatement = (ast: t.Node, template: string, replace: boolean = true) => {
	const returnObjectProperties: t.ObjectProperty[] = [];
	const returnObjectPropertiesNames: string[] = [];

	traverse(ast, {
		BlockStatement(path: NodePath<t.BlockStatement>) {
			if (!path?.parentPath?.parentPath?.parent) {
				return;
			}

			const parent = path.parentPath.parentPath.parent;

			if (!t.isCallExpression(parent) || !t.isIdentifier(parent.callee) || parent.callee.name !== 'defineComponent') {
				return;
			}

			// Process the use-i18n - i.e. const { t } = useI18n()
			const resultUseI18n = processUseI18n(ast, [], template);

			const getReturnStatement = () => {
				const returnStatement = path.node.body.find((node) => t.isReturnStatement(node));

				if (!returnStatement) {
					return t.returnStatement(t.objectExpression([]));
				}

				if (t.isObjectExpression(returnStatement.argument)) {
					const propertiesObject = returnStatement.argument.properties.filter((node) => t.isObjectProperty(node));

					const otherProperties = returnStatement.argument.properties.filter((node) => !t.isObjectProperty(node));

					returnObjectProperties.push(...propertiesObject);
					returnObjectPropertiesNames.push(...propertiesObject.map((property) => (property.key as t.Identifier).name));

					const uniqueProperties = filterUniqueArgs([...propertiesObject, ...resultUseI18n.args]);

					return t.returnStatement(t.objectExpression([...uniqueProperties, ...otherProperties]));
				}

				return t.returnStatement(t.objectExpression([]));
			};

			const returnStatement = getReturnStatement();

			const body = path.node.body.filter((node) => !t.isReturnStatement(node));

			if (replace) {
				if (resultUseI18n.useI18nCall) {
					path.replaceWith(
						t.blockStatement([
							...body.map(wrapNewLineComment),
							wrapNewLineComment(resultUseI18n.useI18nCall),
							wrapNewLineComment(returnStatement),
						]),
					);
					path.skip();
				}

				if (!resultUseI18n.useI18nCall && resultUseI18n.args.length > 0) {
					path.replaceWith(t.blockStatement([...body.map(wrapNewLineComment), wrapNewLineComment(returnStatement)]));
					path.skip();
				}
			} else {
				path.skip();
			}
		},
	});

	return {
		returnObjectProperties,
		returnObjectPropertiesNames,
	};
};
