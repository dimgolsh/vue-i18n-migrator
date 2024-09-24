import { SFCDescriptor } from '@vue/compiler-sfc';
import { newLine } from '@/convert/utils';

export const generateVue = (sfc: SFCDescriptor, code: string) => {
	const codeFormat = code.trim().replaceAll(`\/\/${newLine}`, '');
	const rawCodeVue = `<template>${sfc.template.content.trim()}</template>\n\n<script setup lang="ts">${codeFormat}</script>`;

	const styles = `\n\n${sfc.styles.map((style) => `<style${style.scoped ? ' scoped' : ''} ${style.attrs?.lang ? `lang="${style.attrs.lang}"` : ''}>${style.content.trim()}</style>`).join('\n\t')}`;

	return rawCodeVue + styles;
};
