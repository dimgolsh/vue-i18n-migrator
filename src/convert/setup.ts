import * as t from '@babel/types';
import { getSetup } from '@/convert/utils';

export const getSetupContent = (path: t.ObjectExpression) => {
	const setup = getSetup(path.properties);

	if (!setup) {
		return [];
	}

	const body = setup.body.body;
	// Filter
	return body.filter((node) => !t.isReturnStatement(node));
};
