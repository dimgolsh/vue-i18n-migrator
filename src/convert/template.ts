import { parse } from '@vue/compiler-sfc';

interface I18nUsage {
	t: boolean;
	tc: boolean;
	n: boolean;
	d: boolean;
	i18nT: boolean;
}

export const checkI18nUsage = (template: string): I18nUsage => {
	const { descriptor } = parse(`<template>${template}</template>`);

	if (!descriptor.template) {
		return { t: false, tc: false, n: false, d: false, i18nT: false };
	}

	const content = descriptor.template.content;

	return {
		t: content.includes('$t('),
		tc: content.includes('$tc('),
		n: content.includes('$n('),
		d: content.includes('$d('),
		i18nT: content.includes('<i18n-t') || content.includes('<I18nT'),
	};
};

export const transformTemplate = (template: string): string => {
	const { descriptor } = parse(`<template>${template}</template>`);

	if (!descriptor.template) {
		return template;
	}

	const content = descriptor.template.content
		// Transform interpolation i18n calls to composition calls
		.replace(/\{\{\s*\$([tdn]|tc)\(([\s\S]*?)\)\s*\}\}/g, (_, func, args) => {
			// Convert $tc to t
			if (func === 'tc') return `{{ t(${args}) }}`;
			return `{{ ${func}(${args}) }}`;
		})
		// Transform v-bind shorthand with i18n
		.replace(/:([^=\s]+)="(\$(?:[tdn]|tc)\([^"]+\))"/g, (_, prop, call) => {
			// Convert $tc to t
			if (call.startsWith('$tc')) {
				return `:${prop}="${call.replace('$tc', 't')}"`;
			}
			return `:${prop}="${call.replace('$', '')}"`;
		})
		// Transform v-bind object syntax with i18n
		.replace(/v-bind="({[^}]+})"/g, (_, obj) => {
			return `v-bind="${obj
				.replace(/\$tc\(/g, 't(')
				.replace(/\$t\(/g, 't(')
				.replace(/\$d\(/g, 'd(')
				.replace(/\$n\(/g, 'n(')}"`;
		})
		// Transform dynamic component with i18n
		.replace(/:is="\$([tdn]|tc)\((.*?)\)"/g, (_, func, args) => {
			// Convert $tc to t
			if (func === 'tc') return `:is="t(${args})"`;
			return `:is="${func}(${args})"`;
		})
		// Transform other attributes with i18n but preserve the attribute name
		.replace(/(\w+)="\$([tdn]|tc)\((.*?)\)"/g, (_, attr, func, args) => {
			// Convert $tc to t
			if (func === 'tc') return `${attr}="t(${args})"`;
			return `${attr}="${func}(${args})"`;
		})
		// Transform remaining i18n calls in text content
		.replace(/\$([tdn]|tc)\((.*?)\)/g, (_, func, args) => {
			// Convert $tc to t
			if (func === 'tc') return `t(${args})`;
			return `${func}(${args})`;
		});

	return content;
};

export const processTemplate = (template: string | undefined): string | undefined => {
	if (!template) {
		return undefined;
	}

	return transformTemplate(template);
};
