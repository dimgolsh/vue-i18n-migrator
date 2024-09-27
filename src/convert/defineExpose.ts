import * as t from '@babel/types';
import { getProperty } from './utils';

export const getDefineExpose = (path: t.ObjectExpression) => {
	const properties = path.properties;

	const exposeProperty = getProperty(properties, 'expose');

	if (!exposeProperty) {
		return null;
	}

	if (!t.isArrayExpression(exposeProperty.value)) {
		return null;
	}

	const elements = exposeProperty.value.elements;
	const results: t.ObjectProperty[] = [];
	for (const element of elements) {
		if (t.isStringLiteral(element)) {
			results.push(t.objectProperty(t.identifier(element.value), t.identifier(element.value), false, true));
		}
	}

	const expression = t.objectExpression(results);
	const callExpression = t.callExpression(t.identifier('defineExpose'), [expression]);
	return t.expressionStatement(callExpression);
};
