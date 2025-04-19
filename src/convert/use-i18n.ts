import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { NodePath } from '@babel/traverse';
import { checkI18nUsage } from './template';

//** Create an object property
// i.e. { t }
export const createShortandObjectProperty = (key: string) => {
	return t.objectProperty(t.identifier(key), t.identifier(key), false, true);
};

//** Create a call expression for useI18n
// i.e. useI18n()
export const createCallI18n = () => {
	return t.callExpression(t.identifier('useI18n'), [t.identifier('i18n')]);
};

//** Create an i18n call expression
// i.e. const { t } = useI18n()
export const createI18nCall = (args: t.ObjectProperty[]): t.VariableDeclaration => {
	return t.variableDeclaration('const', [t.variableDeclarator(t.objectPattern([...args]), createCallI18n())]);
};

const isHasUseI18n = (
	node: t.VariableDeclaration,
): { has: boolean; arguments: t.ObjectProperty[]; hasI18nMessage: boolean; argumentsNames: string[] } => {
	if (!t.isVariableDeclarator(node.declarations[0])) {
		return { has: false, arguments: [], hasI18nMessage: false, argumentsNames: [] };
	}

	const decl = node.declarations[0];

	if (!t.isVariableDeclarator(decl)) {
		return { has: false, arguments: [], hasI18nMessage: false, argumentsNames: [] };
	}

	if (
		!t.isCallExpression(decl.init) ||
		!t.isIdentifier(decl.init.callee) ||
		!t.isObjectPattern(decl.id) ||
		decl.init.callee.name !== 'useI18n'
	) {
		return { has: false, arguments: [], hasI18nMessage: false, argumentsNames: [] };
	}

	const hasI18nMessage =
		decl.init.arguments[0] && t.isIdentifier(decl.init.arguments[0]) && decl.init.arguments[0].name === 'i18n';

	const argumentsNames = decl.id.properties
		.filter((property) => t.isObjectProperty(property))
		.map((property) => (property.key as t.Identifier).name);

	return { has: true, arguments: decl.id.properties as t.ObjectProperty[], hasI18nMessage, argumentsNames };
};

//** Filter unique arguments
// i.e. const { t, n } = useI18n()
export const filterUniqueArgs = (args: t.ObjectProperty[]): t.ObjectProperty[] => {
	return args.filter(
		(arg, index, self) =>
			self.findIndex((t) => (t.key as t.Identifier).name === (arg.key as t.Identifier).name) === index,
	);
};

//** Process existing i18n
// i.e. const { t } = useI18n()
export const processExistingI18n = (ast: t.Node, args: t.ObjectProperty[], replace: boolean = true) => {
	let hasI18n = false;

	traverse(ast, {
		VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
			const isHasUseI18nResult = isHasUseI18n(path.node);

			if (!isHasUseI18nResult.has) {
				return;
			}

			if (isHasUseI18nResult.arguments.length === 0) {
				return;
			}

			if (replace) {
				path.replaceWith(createI18nCall(filterUniqueArgs([...args, ...isHasUseI18nResult.arguments])));
				path.skip();
			}

			hasI18n = true;
		},
	});

	return hasI18n;
};

export const processUseI18n = (ast: t.Node, statements: t.Statement[], template: string) => {
	const { t, tc, n, d } = checkI18nUsage(template);

	const args: t.ObjectProperty[] = [];

	if (t || tc) {
		args.push(createShortandObjectProperty('t'));
	}

	if (n) {
		args.push(createShortandObjectProperty('n'));
	}

	if (d) {
		args.push(createShortandObjectProperty('d'));
	}

	// Process existing i18n
	// i.e. const { t } = useI18n()
	const hasI18n = processExistingI18n(ast, args);

	// If no use-i18n, create a new one
	if (!hasI18n && args.length > 0) {
		const useI18nCall = createI18nCall(filterUniqueArgs(args));
		statements.push(useI18nCall);

		return {
			args,
			useI18nCall,
		};
	}

	return {
		args,
	};
};

//** Process existing i18n
// i.e. const { t } = useI18n()
export const findExistingI18n = (ast: t.Node) => {
	let hasI18n: { has: boolean; arguments: t.ObjectProperty[]; hasI18nMessage: boolean; argumentsNames: string[] } =
		null;

	traverse(ast, {
		VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
			const isHasUseI18nResult = isHasUseI18n(path.node);

			if (!isHasUseI18nResult.has) {
				return;
			}

			hasI18n = isHasUseI18nResult;
		},
	});

	return hasI18n;
};
