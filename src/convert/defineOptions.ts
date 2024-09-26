import * as t from '@babel/types';
import { ObjectProperty } from '@babel/types';
import { getProperty } from './utils';

export const getDefineOptions = (path: t.ObjectExpression) => {
	const properties = path.properties;
	const options: ObjectProperty[] = [];

	const nameProperty = getProperty(properties, 'name');

	if (nameProperty) {
		options.push(
			t.objectProperty(t.identifier('name'), t.stringLiteral((nameProperty.value as t.StringLiteral).value)),
		);
	}

	properties.forEach((node) => {
		if (t.isObjectProperty(node) && t.isIdentifier(node.key)) {
			const name = node.key.name;
			if (!['name', 'components', 'props', 'setup', 'emits', 'expose'].includes(name)) {
				options.push(node);
			}
		}
	});

	if (options.length) {
		return t.expressionStatement(t.callExpression(t.identifier('defineOptions'), [t.objectExpression(options)]));
	}

	return null;
};
