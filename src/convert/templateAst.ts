// import { parse as parseTemplate, transform } from '@vue/compiler-dom';
// import type {
// 	DirectiveNode,
// 	ElementNode,
// 	InterpolationNode,
// 	SimpleExpressionNode,
// 	TemplateChildNode,
// 	TextNode,
// 	NodeTransform,
// 	AttributeNode,
// } from '@vue/compiler-dom';

// const transformI18nCall = (exp: string): string => {
// 	if (exp.startsWith('$tc(')) {
// 		return exp.replace('$tc(', 't(');
// 	}
// 	return exp.replace(/\$([td])\(/, '$1(');
// };

// enum NodeTypes {
// 	ROOT = 0,
// 	ELEMENT = 1,
// 	TEXT = 2,
// 	COMMENT = 3,
// 	SIMPLE_EXPRESSION = 4,
// 	INTERPOLATION = 5,
// 	ATTRIBUTE = 6,
// 	DIRECTIVE = 7,
// 	COMPOUND_EXPRESSION = 8,
// 	IF = 9,
// 	IF_BRANCH = 10,
// 	FOR = 11,
// 	TEXT_CALL = 12,
// 	VNODE_CALL = 13,
// 	JS_CALL_EXPRESSION = 14,
// 	JS_OBJECT_EXPRESSION = 15,
// 	JS_PROPERTY = 16,
// 	JS_ARRAY_EXPRESSION = 17,
// 	JS_FUNCTION_EXPRESSION = 18,
// 	JS_CONDITIONAL_EXPRESSION = 19,
// 	JS_CACHE_EXPRESSION = 20,
// 	JS_BLOCK_STATEMENT = 21,
// 	JS_TEMPLATE_LITERAL = 22,
// 	JS_IF_STATEMENT = 23,
// 	JS_ASSIGNMENT_EXPRESSION = 24,
// 	JS_SEQUENCE_EXPRESSION = 25,
// 	JS_RETURN_STATEMENT = 26,
// }

// const isSimpleExpression = (node: any): node is SimpleExpressionNode => {
// 	return node && node.type === NodeTypes.SIMPLE_EXPRESSION;
// };

// const transformI18nNode: NodeTransform = (node) => {
// 	// Transform text interpolations
// 	if (node.type === NodeTypes.INTERPOLATION) {
// 		const interpolation = node as InterpolationNode;
// 		if (isSimpleExpression(interpolation.content)) {
// 			const exp = interpolation.content;
// 			if (exp.content.match(/\$(?:t|d|tc)\(/)) {
// 				exp.content = transformI18nCall(exp.content);
// 			}
// 		}
// 	}

// 	// Transform element directives and attributes
// 	if (node.type === NodeTypes.ELEMENT) {
// 		const element = node as ElementNode;

// 		// Transform directives (v-bind, etc)
// 		element.props.forEach((prop) => {
// 			if (prop.type === NodeTypes.DIRECTIVE) {
// 				const directive = prop as DirectiveNode;
// 				if (directive.exp && isSimpleExpression(directive.exp)) {
// 					if (directive.exp.content.match(/\$(?:t|d|tc)\(/)) {
// 						directive.exp.content = transformI18nCall(directive.exp.content);
// 					}
// 				}
// 			} else if (prop.type === NodeTypes.ATTRIBUTE) {
// 				const attribute = prop as AttributeNode;
// 				if (attribute.value && attribute.value.content.match(/\$(?:t|d|tc)\(/)) {
// 					attribute.value.content = transformI18nCall(attribute.value.content);
// 				}
// 			}
// 		});
// 	}

// 	// Transform text nodes that might contain i18n calls
// 	if (node.type === NodeTypes.TEXT) {
// 		const textNode = node as TextNode;
// 		if (textNode.content.match(/\$(?:t|d|tc)\(/)) {
// 			textNode.content = transformI18nCall(textNode.content);
// 		}
// 	}
// };

// const generateTemplate = (node: TemplateChildNode): string => {
// 	if (node.type === NodeTypes.ELEMENT) {
// 		const element = node as ElementNode;
// 		let code = `<${element.tag}`;

// 		// Add attributes and directives
// 		element.props.forEach((prop) => {
// 			if (prop.type === NodeTypes.DIRECTIVE) {
// 				const directive = prop as DirectiveNode;
// 				if (directive.arg && isSimpleExpression(directive.exp)) {
// 					code += ` :${(directive.arg as SimpleExpressionNode).content}="${directive.exp.content}"`;
// 				} else if (isSimpleExpression(directive.exp)) {
// 					code += ` v-bind="${directive.exp.content}"`;
// 				}
// 			} else if (prop.type === NodeTypes.ATTRIBUTE) {
// 				const attribute = prop as AttributeNode;
// 				code += ` ${attribute.name}="${attribute.value?.content || ''}"`;
// 			}
// 		});

// 		if (element.children.length) {
// 			code += '>';
// 			code += element.children.map(generateTemplate).join('');
// 			code += `</${element.tag}>`;
// 		} else {
// 			code += ' />';
// 		}
// 		return code;
// 	}

// 	if (node.type === NodeTypes.INTERPOLATION) {
// 		const interpolation = node as InterpolationNode;
// 		if (isSimpleExpression(interpolation.content)) {
// 			return `{{ ${interpolation.content.content} }}`;
// 		}
// 	}

// 	if (node.type === NodeTypes.TEXT) {
// 		return (node as TextNode).content;
// 	}

// 	return '';
// };

// export const transformTemplateAst = (template: string): string => {
// 	const ast = parseTemplate(template);

// 	if (!ast) {
// 		return template;
// 	}

// 	transform(ast, {
// 		nodeTransforms: [transformI18nNode],
// 	});

// 	return ast.children.map(generateTemplate).join('');
// };

// export const processTemplateAst = (template: string | undefined): string | undefined => {
// 	if (!template) {
// 		return undefined;
// 	}

// 	return transformTemplateAst(template);
// };
