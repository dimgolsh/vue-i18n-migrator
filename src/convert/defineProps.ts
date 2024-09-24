import * as t from '@babel/types';
import { extractSetupParams, getProperty, getSetup } from '@/convert/utils';

export const getDefineProps = (path: t.ObjectExpression) => {
	const properties = path.properties;

	const propsProperty = getProperty(properties, 'props');

	if (!propsProperty) {
		return null;
	}

	const callExpression = t.callExpression(t.identifier('defineProps'), [propsProperty.value as t.Expression]);
	const setup = getSetup(properties);
	if (!setup) {
		return t.expressionStatement(callExpression);
	}

	const { props } = extractSetupParams(setup);
	if (props) {
		return t.variableDeclaration('const', [t.variableDeclarator(t.identifier('props'), callExpression)]);
	}

	return t.expressionStatement(callExpression);
};
