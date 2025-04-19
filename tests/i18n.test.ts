import { describe, it, expect } from 'vitest';
import { convert } from '../src/convert';
import { compareCode } from './utils';

describe('i18n conversion', () => {
	describe('script setup', () => {
		it('should add i18n when no existing useI18n', async () => {
			const input = `
<script setup lang="ts">
import i18n from './i18n';
const message = 'Hello';

defineOptions({
  name: 'MyComponent',
  i18n,
});
</script>

<template>
  <div>{{ $t('hello') }}</div>
</template>`;

			const expected = `
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';
const message = 'Hello';

defineOptions({
  name: 'MyComponent'
});

const { 
t 
} = useI18n(i18n);
</script>

<template>
  <div>{{ t('hello') }}</div>
</template>`;

			const result = await convert(input);
			expect(result.isOk).toBe(true);

			const comparison = await compareCode(expected, result.content);

			expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
		});

		it('should handle multiple i18n functions', async () => {
			const input = `
<script setup lang="ts">
import i18n from './i18n';
defineOptions({ name: 'DateComponent', i18n });
</script>

<template>
  <div>
    <p>{{ $t('date') }}</p>
    <p>{{ $d(date, 'long') }}</p>
    <p>{{ $tc('items', count) }}</p>
  </div>
</template>`;

			const expected = `
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';
defineOptions({
  name: 'DateComponent'
});
const { t, d } = useI18n(i18n);
</script>

<template>
  <div>
    <p>{{ t('date') }}</p>
    <p>{{ d(date, 'long') }}</p>
    <p>{{ t('items', count) }}</p>
  </div>
</template>`;

			const result = await convert(input);
			expect(result.isOk).toBe(true);
			const comparison = await compareCode(expected, result.content);
			expect(comparison.normalizedExpected).toBe(comparison.normalizedActual);
		});

		it('should handle complex template expressions', async () => {
			const input = `
<script setup lang="ts">
import i18n from './i18n';
defineOptions({ name: 'ComplexComponent', i18n });
</script>

<template>
  <div>
    <p :title="$t('tooltip')" v-bind="{ label: $t('label') }">
      {{ $t('welcome', { name: user.name }) }}
    </p>
    <component :is="$t('dynamicComponent')" />
  </div>
</template>`;

			const expected = `
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';
defineOptions({
  name: 'ComplexComponent'
});
const { t } = useI18n(i18n);
</script>

<template>
  <div>
    <p :title="t('tooltip')" v-bind="{ label: t('label') }">
      {{ t('welcome', { name: user.name }) }}
    </p>
    <component :is="t('dynamicComponent')" />
  </div>
</template>`;

			const result = await convert(input);
			expect(result.isOk).toBe(true);

			const comparison = await compareCode(expected, result.content);
			expect(comparison.normalizedExpected).toBe(comparison.normalizedActual);
		});
	});
});
