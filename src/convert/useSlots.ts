import * as t from '@babel/types';
import { extractSetupParams, getSetup } from './utils';

export const getUseSlots = (path: t.ObjectExpression) => {
	const properties = path.properties;

	const setup = getSetup(properties);
	if (!setup) {
		return null;
	}

	const { slots } = extractSetupParams(setup);

	if (!slots) {
		return null;
	}

	const callExpression = t.callExpression(t.identifier('useSlots'), []);
	return t.variableDeclaration('const', [t.variableDeclarator(t.identifier('slots'), callExpression)]);
};
