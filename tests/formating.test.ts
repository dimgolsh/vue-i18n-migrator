import { convert } from '../src/convert';
import { expect, it, describe } from 'vitest';
import { compareCode } from './utils';

describe('formating', () => {
	it('should convert component with scoped styles', async () => {
		const input = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'StyledComponent', i18n });
	useI18n(i18n);
</script>
<template>
	<div class="container">
		<p>{{ $t('Hello') }}</p>
	</div>
</template>
<style scoped>
.container {
	padding: 20px;
}
</style>`;

		const expected = `
<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';

	defineOptions({
		name: 'StyledComponent',
		i18n,
	});

	const { t } = useI18n(i18n);
</script>

<template>
	<div class="container">
		<p>{{ t('Hello') }}</p>
	</div>
</template>

<style scoped>
.container {
	padding: 20px;
}
</style>`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);
		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});

	it('should convert component with multiple styles', async () => {
		const input = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'MultiStyleComponent', i18n });
	useI18n(i18n);
</script>
<template>
	<div class="container">
		<p>{{ $t('Hello') }}</p>
	</div>
</template>
<style scoped lang="scss">
.container {
	padding: 20px;
}
</style>
<style>
.global-style {
	margin: 10px;
}
</style>`;

		const expected = `
<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';

	defineOptions({
		name: 'MultiStyleComponent',
		i18n,
	});

	const { t } = useI18n(i18n);
</script>

<template>
	<div class="container">
		<p>{{ t('Hello') }}</p>
	</div>
</template>

<style lang="scss" scoped>
.container {
	padding: 20px;
}
</style>
<style>
.global-style {
	margin: 10px;
}
</style>`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);
		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});

	it('should convert component with external style', async () => {
		const input = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'ExternalStyleComponent', i18n });
	useI18n(i18n);
</script>
<template>
	<div class="container">
		<p>{{ $t('Hello') }}</p>
	</div>
</template>
<style scoped src="./styles.scss"/>`;

		const expected = `
<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';

	defineOptions({
		name: 'ExternalStyleComponent',
		i18n,
	});

	const { t } = useI18n(i18n);
</script>

<template>
	<div class="container">
		<p>{{ t('Hello') }}</p>
	</div>
</template>

<style scoped src="./styles.scss"/>`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);
		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});
});
