import { SFCDescriptor } from '@vue/compiler-sfc';
import { processTemplate } from './template';
import { newLine } from './utils';
import { BlockOrder } from './types';

export const generateVue = (
	sfc: SFCDescriptor,
	code: string,
	blockOrder = BlockOrder.SetupTemplateStyle,
	isSetup = false,
	additionalScriptContent = '',
): string => {
	const codeFormat = code.trim().replaceAll(`\/\/${newLine}`, '');
	const template = sfc.template?.content?.trim() ? processTemplate(sfc.template?.content) : '';
	const content = `<template>${template}</template>`;
	const rawCodeVue = `<script ${isSetup ? 'setup' : ''} lang="ts">${codeFormat}</script>`;
	const additionalScript = additionalScriptContent ? `<script lang="ts">${additionalScriptContent}</script>` : '';

	const styles = `${sfc.styles.map((style) => `<style ${style.attrs?.lang ? `lang="${style.attrs.lang}" ${style.scoped ? ' scoped' : ''}` : `${style.scoped ? 'scoped' : ''}`}>${style.content.trim()}</style>`).join('\n\t')}`;

	const vue = additionalScriptContent ? `${rawCodeVue}\n\n${additionalScript}` : rawCodeVue;

	return blockOrder === BlockOrder.TemplateSetupStyle
		? `${content}\n\n${vue}\n\n${styles}`
		: `${vue}\n\n${content}\n\n${styles}`;
};
