import { convert } from '../src/convert';
import { expect, it, describe } from 'vitest';
import { compareCode } from './utils';

describe('setup', () => {
	it('should convert with existing useI18n', async () => {
		const input = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'I18nTComponent', i18n });

    useI18n(i18n);
</script>
<template>
	<div>
		<i18n-t keypath="hello">{{ $t('Hello')}}</i18n-t>
	</div>
</template>`;

		const expected = `
<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';

	defineOptions({
		name: 'I18nTComponent',
		i18n,
	});

	const { t } = useI18n(i18n);
</script>

<template>
	<div>
		<i18n-t keypath="hello">{{ t('Hello') }}</i18n-t>
	</div>
</template>
`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);

		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});
});
