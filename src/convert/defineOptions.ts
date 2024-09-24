import * as t from '@babel/types';
import { ObjectProperty } from '@babel/types';
import { getProperty, wrapNewLineComment } from './utils';

export const getDefineOptions = (path: t.ObjectExpression) => {
	const properties = path.properties;
	const options: ObjectProperty[] = [];

	const nameProperty = getProperty(properties, 'name');
	const i18nProperty = getProperty(properties, 'i18n');

	if (nameProperty) {
		options.push(
			t.objectProperty(t.identifier('name'), t.stringLiteral((nameProperty.value as t.StringLiteral).value)),
		);
	}

	if (i18nProperty) {
		options.push(t.objectProperty(t.identifier('i18n'), t.identifier('i18n'), false, true));
	}

	if (options.length) {
		return wrapNewLineComment(
			t.expressionStatement(t.callExpression(t.identifier('defineOptions'), [t.objectExpression(options)])),
		);
	}

	return null;
};
