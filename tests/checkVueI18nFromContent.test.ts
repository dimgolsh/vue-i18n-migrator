import { describe } from 'node:test';
import { checkVueI18nFromContent } from 'src/convert/utils/checkVueI18n';
import { expect, it } from 'vitest';

describe('checkVueI18nFromContent', () => {
	it('should return true if the content is correct', async () => {
		const content = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'I18nTComponent', i18n });
</script>
`;
		const result = await checkVueI18nFromContent(content);

		expect(result.errors).toEqual(['⚠ Vue file should not has i18n property in defineOptions']);
		expect(result.isOk).toBe(false);
	});

	it('should return true if the content is correct with script setup', async () => {
		const content = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'I18nTComponent'});

    const { t } = useI18n(i18n);
</script>
<template>
	<div>
		<h1>{{ t('hello') }}</h1>
	</div>
</template>
`;

		const result = await checkVueI18nFromContent(content);

		expect(result.errors).toEqual([]);
		expect(result.isOk).toBe(true);
	});

	it('should return true if the content is correct with script setup and legacy i18n-t usage', async () => {
		const content = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'I18nTComponent', i18n });

    useI18n(i18n);
</script>
<template>
	<div>
		<i18n-t keypath="hello">Hello</i18n-t>
	</div>
</template>
`;

		const result = await checkVueI18nFromContent(content, { legacy: true });

		expect(result.errors).toEqual([]);
		expect(result.isOk).toBe(true);
	});

	it('should return false if the content is not correct with script setup and legacy i18n-t usage', async () => {
		const content = `
<script setup lang="ts">
	import i18n from './i18n';
	defineOptions({ name: 'I18nTComponent', i18n });

</script>
<template>
	<div>
		<i18n-t keypath="hello">Hello</i18n-t>
	</div>
</template>
`;

		const result = await checkVueI18nFromContent(content, { legacy: true });

		expect(result.errors).toEqual(['⚠ Vue file should has useI18n(i18n)']);
		expect(result.isOk).toBe(false);
	});

	it('should skip if no script and no script setup and no i18n usage in template', async () => {
		const content = `
<template>
	<div>
		
	</div>
</template>
`;

		const result = await checkVueI18nFromContent(content, { legacy: true });

		expect(result.isOk).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it('should error if no script and no script setup and has i18n usage in template', async () => {
		const content = `
<template>
	<div>
		<h1>{{ $t('hello') }}</h1>
	</div>
</template>
`;

		const result = await checkVueI18nFromContent(content, { legacy: true });

		expect(result.isOk).toBe(false);
		expect(result.errors).toEqual(['⚠ Vue file must contain either script or script setup']);
	});

	it('should error if no script', async () => {
		const content = `
<template>
	<div class="invitation-team">
		<ScText
			color="mulberry-purple"
			size="14"
		>
			{{ $t('ToTeamDescription') }}
		</ScText>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from 'vue';
	import i18n from './i18n';


	export default defineComponent({
		name: 'InvitationTeam',
		i18n,
		components: {},
	});
</script>
`;

		const result = await checkVueI18nFromContent(content, { legacy: true });

		expect(result.isOk).toBe(false);
		expect(result.errors).toEqual([
			'⚠ Vue file template contain deprecated i18n usage',
			'⚠ return object should has t, n or d property',
			'⚠ Vue file should has useI18n(i18n)',
		]);
	});
});
