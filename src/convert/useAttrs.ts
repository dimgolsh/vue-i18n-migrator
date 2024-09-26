import * as t from '@babel/types';
import { extractSetupParams, getSetup } from './utils';

export const getUseAttrs = (path: t.ObjectExpression) => {
	const properties = path.properties;

	const setup = getSetup(properties);
	if (!setup) {
		return null;
	}

	const { attrs } = extractSetupParams(setup);

	if (!attrs) {
		return null;
	}

	const callExpression = t.callExpression(t.identifier('useAttrs'), []);
	return t.variableDeclaration('const', [t.variableDeclarator(t.identifier('attrs'), callExpression)]);
};
