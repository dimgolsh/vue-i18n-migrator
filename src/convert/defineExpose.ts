import * as t from '@babel/types';
import { getProperty } from './utils';

export const getDefineExpose = (path: t.ObjectExpression) => {
	const properties = path.properties;

	const exposeProperty = getProperty(properties, 'expose');

	if (!exposeProperty) {
		return null;
	}

	const callExpression = t.callExpression(t.identifier('defineExpose'), [exposeProperty.value as t.Expression]);
	return t.expressionStatement(callExpression);
};
