import { SFCDescriptor } from '@vue/compiler-sfc';
import { newLine } from './utils';
import { BlockOrder } from './types';

export const generateVue = (sfc: SFCDescriptor, code: string, blockOrder = BlockOrder.SetupTemplateStyle) => {
	const codeFormat = code.trim().replaceAll(`\/\/${newLine}`, '');
	const content = sfc.template?.content?.trim() ? `<template>${sfc.template.content.trim()}</template>` : '';
	const rawCodeVue = `\n\n<script setup lang="ts">${codeFormat}</script>`;

	const styles = `\n\n${sfc.styles.map((style) => `<style ${style.attrs?.lang ? `lang="${style.attrs.lang}" ${style.scoped ? ' scoped' : ''}` : ''}>${style.content.trim()}</style>`).join('\n\t')}`;

	return blockOrder === BlockOrder.TemplateSetupStyle ? content + rawCodeVue + styles : rawCodeVue + content + styles;
};
