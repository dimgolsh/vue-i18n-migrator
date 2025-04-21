import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ConvertOptions } from '../types';

const findI18nProperty = (property: t.ObjectProperty) => {
	return t.isObjectProperty(property) && t.isIdentifier(property.key) && property.key.name === 'i18n';
};

export const convertDefineComponent = (
	ast: t.Node,
	_template: string,
	replace: boolean = true,
	options?: ConvertOptions,
) => {
	let hasI18n = false;
	const { legacy = false } = options || {};

	if (legacy) {
		return false;
	}

	traverse(ast, {
		ObjectExpression(path) {
			if (!t.isCallExpression(path.parent)) {
				return;
			}

			const callee = path.parent.callee;

			if (!t.isIdentifier(callee) || callee.name !== 'defineComponent') {
				return;
			}

			const properties = path.node.properties.filter((property) => {
				if (t.isObjectProperty(property)) {
					return !findI18nProperty(property);
				}
				return true;
			});

			if (path.node.properties.find((property) => t.isObjectProperty(property) && findI18nProperty(property))) {
				hasI18n = true;
			}

			if (replace) {
				path.replaceWith(t.objectExpression([...properties]));
				path.skip();
			}
		},
	});

	return hasI18n;
};
