import * as t from '@babel/types';
import { getProperty } from './utils';

// AsyncHelloWorld: defineAsyncComponent(() => import('./hello-world.vue')),
export const getComponents = (path: t.ObjectExpression): t.VariableDeclaration[] => {
	const properties = path.properties;
	const componentsProperty = getProperty(properties, 'components');
	const nodes: t.VariableDeclaration[] = [];

	if (!componentsProperty) {
		return [];
	}

	const value = componentsProperty.value;
	if (!t.isObjectExpression(value)) {
		return [];
	}
	value.properties.forEach((property) => {
		if (t.isObjectProperty(property) && t.isIdentifier(property.key)) {
			if (t.isCallExpression(property.value)) {
				nodes.push(
					t.variableDeclaration('const', [t.variableDeclarator(t.identifier(property.key.name), property.value)]),
				);
			}
		}
	});

	return nodes;
};
