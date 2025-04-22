import { expect, it, describe } from 'vitest';
import { convert } from '../src/convert';
import { compareCode } from './utils';

describe('template', () => {
	it('should convert complex interpolation with nested objects', async () => {
		const input = `
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';

defineOptions({
	name: 'ValidationMessage',
    i18n
});
</script>

<template>
	<ScValidationMessage type="maxLength">
		{{
			$t('MaxSymbolsError', {
				char: form.description.value?.length ?? 0 - 500,
			})
		}}
	</ScValidationMessage>
</template>`;

		const expected = `
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';

defineOptions({
	name: 'ValidationMessage',
    i18n
});

const { t } = useI18n(i18n);
</script>

<template>
	<ScValidationMessage type="maxLength">
		{{
			t('MaxSymbolsError', {
				char: form.description.value?.length ?? 0 - 500,
			})
		}}
	</ScValidationMessage>
</template>`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);
		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});
});
