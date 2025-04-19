import { SFCDescriptor } from '@vue/compiler-sfc';
import { processTemplate } from './template';
import { newLine } from './utils';
import { BlockOrder } from './types';

export const generateVue = (
	sfc: SFCDescriptor,
	code: string,
	blockOrder = BlockOrder.SetupTemplateStyle,
	isSetup = false,
): string => {
	const codeFormat = code.trim().replaceAll(`\/\/${newLine}`, '');
	const template = sfc.template?.content?.trim() ? processTemplate(sfc.template?.content) : '';
	const content = `<template>${template}</template>`;
	const rawCodeVue = `<script ${isSetup ? 'setup' : ''} lang="ts">${codeFormat}</script>`;

	const styles = `${sfc.styles.map((style) => `<style ${style.attrs?.lang ? `lang="${style.attrs.lang}" ${style.scoped ? ' scoped' : ''}` : `${style.scoped ? 'scoped' : ''}`}>${style.content.trim()}</style>`).join('\n\t')}`;

	return blockOrder === BlockOrder.TemplateSetupStyle
		? `${content}\n\n${rawCodeVue}\n\n${styles}`
		: `${rawCodeVue}\n\n${content}\n\n${styles}`;
};
