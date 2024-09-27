import * as t from '@babel/types';
import { getSetup } from './utils';

export const getSetupContent = (path: t.ObjectExpression) => {
	const setup = getSetup(path.properties);

	if (!setup) {
		return [];
	}

	const body = setup.body.body;

	// Filter
	const result = body.filter((node) => !t.isReturnStatement(node));

	const returnStatement = body.find((node) => t.isReturnStatement(node));

	if (!returnStatement) {
		return result;
	}

	if (!t.isObjectExpression(returnStatement.argument)) {
		return result;
	}

	const properties = returnStatement.argument.properties;

	if (properties.length === 0) {
		return result;
	}

	for (const property of properties) {
		if (t.isObjectProperty(property) && !property.shorthand && t.isIdentifier(property.key)) {
			const name = property.key.name;

			// isChecked: computed(() => checked.value),
			if (t.isExpression(property.value)) {
				const res = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), property.value)]);
				result.push(res);
			}
		}
	}

	return result;
};
