import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { test, expect } from 'vitest';
import { clean } from './utils';

test('CLI convert single file', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');
	const outputPath = path.resolve(__dirname, 'output.vue');

	await fs.writeFile(
		filePath,
		`
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
</template>
  `,
		'utf-8',
	);

	await execa('./dist/cli.js', ['single', filePath]);

	const result = fs.readFileSync(filePath, 'utf-8');

	const expectedCode = `<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';
defineOptions({
  name: 'DateComponent',
});
const { t, d } = useI18n(i18n);
</script>

<template>
  <div>
    <p>{{ t('date') }}</p>
    <p>{{ d(date, 'long') }}</p>
    <p>{{ t('items', count) }}</p>
  </div>
</template>
`;

	expect(clean(result)).toEqual(clean(expectedCode));

	// Чистим файлы после теста
	await fs.remove(filePath);
	await fs.remove(outputPath);
});


test('CLI convert single file with legacy', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');
	const outputPath = path.resolve(__dirname, 'output.vue');

	await fs.writeFile(
		filePath,
		`
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
</template>
  `,
		'utf-8',
	);

	await execa('./dist/cli.js', ['single', filePath, '--legacy']);

	const result = fs.readFileSync(filePath, 'utf-8');

	const expectedCode = `<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';
defineOptions({
  name: 'DateComponent',
  i18n,
});
const { t, d } = useI18n(i18n);
</script>

<template>
  <div>
    <p>{{ t('date') }}</p>
    <p>{{ d(date, 'long') }}</p>
    <p>{{ t('items', count) }}</p>
  </div>
</template>
`;

	expect(clean(result)).toEqual(clean(expectedCode));

	// Чистим файлы после теста
	await fs.remove(filePath);
	await fs.remove(outputPath);
});

test('Test rejects checkVueI18nFromContent', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');

	await fs.writeFile(
		filePath,
		`
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
</template>
  `,
		'utf-8',
	);

	const { stdout } = await execa('./dist/cli.js', ['check-vue-i18n', filePath], {
		reject: false,
	});

	expect(stdout).toContain('⚠ Vue file template contain deprecated i18n usage');
	expect(stdout).toContain('⚠ Vue file should has useI18n(i18n)');
	expect(stdout).toContain('⚠ Vue file should not has i18n property in defineOptions');
});

test('Test rejects checkVueI18nFromContent with legacy', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');

	await fs.writeFile(
		filePath,
		`
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
</template>
  `,
		'utf-8',
	);

	const { stdout } = await execa('./dist/cli.js', ['check-vue-i18n', filePath, '--legacy'], {
		reject: false,
	});

	expect(stdout).toContain('⚠ Vue file template contain deprecated i18n usage');
	expect(stdout).toContain('⚠ Vue file should has useI18n(i18n)');
	expect(stdout).not.toContain('⚠ Vue file should not has i18n property in defineOptions');
});

test('Test check-vue-i18n', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');

	await fs.writeFile(
		filePath,
		`
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
</template>
  `,
		'utf-8',
	);

	await expect(execa('./dist/cli.js', ['check-vue-i18n', filePath])).not.rejects;
});

test('CLI convert all files in folder', async () => {
	const folderPath = path.resolve(__dirname, 'test-folder');
	await fs.ensureDir(folderPath);

	await fs.writeFile(
		path.join(folderPath, 'file1.vue'),
		`
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
</template>
  `,
	);

	await fs.writeFile(
		path.join(folderPath, 'file2.vue'),
		`
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
		components: {
		},
		setup() {
			const { accountId } = useUser();
			
			return {
				accountId
			};
		},
	});
</script>
  `,
	);

	// Запускаем CLI
	await execa('./dist/cli.js', ['folder', folderPath]);

	const result1 = await fs.readFile(path.join(folderPath, 'file1.vue'), 'utf-8');
	const result2 = await fs.readFile(path.join(folderPath, 'file2.vue'), 'utf-8');

	const expectedCode1 = `<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';
	defineOptions({
		name: 'DateComponent',
	});

	const { t, d } = useI18n(i18n);
</script>

<template>
	<div>
		<p>{{ t('date') }}</p>
		<p>{{ d(date, 'long') }}</p>
		<p>{{ t('items', count) }}</p>
	</div>
</template>
`;

	const expectedCode2 = `<template>
	<div class="invitation-team">
		<ScText
			color="mulberry-purple"
			size="14"
		>
			{{ t('ToTeamDescription') }}
		</ScText>
	</div>
</template>

<script lang="ts">
	import { useI18n } from 'vue-i18n';
	import { defineComponent, ref } from 'vue';
	import i18n from './i18n';
	export default defineComponent({
		name: 'InvitationTeam',
		components: {},
		setup() {
			const { accountId } = useUser();

			const { t } = useI18n(i18n);

			return {
				accountId,
				t,
			};
		},
	});
</script>
`;

	expect(clean(result1)).toEqual(clean(expectedCode1));
	expect(clean(result2)).toEqual(clean(expectedCode2));

	// Удаляем директорию после теста
	await fs.remove(folderPath);
});


test('CLI convert all files in folder with legacy', async () => {
	const folderPath = path.resolve(__dirname, 'test-folder');
	await fs.ensureDir(folderPath);

	await fs.writeFile(
		path.join(folderPath, 'file1.vue'),
		`
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
</template>
  `,
	);

	await fs.writeFile(
		path.join(folderPath, 'file2.vue'),
		`
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
		components: {
		},
		setup() {
			const { accountId } = useUser();
			
			return {
				accountId
			};
		},
	});
</script>
  `,
	);

	// Запускаем CLI
	await execa('./dist/cli.js', ['folder', folderPath, '--legacy']);

	const result1 = await fs.readFile(path.join(folderPath, 'file1.vue'), 'utf-8');
	const result2 = await fs.readFile(path.join(folderPath, 'file2.vue'), 'utf-8');

	const expectedCode1 = `<script setup lang="ts">
	import { useI18n } from 'vue-i18n';
	import i18n from './i18n';
	defineOptions({
		name: 'DateComponent',
		i18n,
	});

	const { t, d } = useI18n(i18n);
</script>

<template>
	<div>
		<p>{{ t('date') }}</p>
		<p>{{ d(date, 'long') }}</p>
		<p>{{ t('items', count) }}</p>
	</div>
</template>
`;

	const expectedCode2 = `<template>
	<div class="invitation-team">
		<ScText
			color="mulberry-purple"
			size="14"
		>
			{{ t('ToTeamDescription') }}
		</ScText>
	</div>
</template>

<script lang="ts">
	import { useI18n } from 'vue-i18n';
	import { defineComponent, ref } from 'vue';
	import i18n from './i18n';
	export default defineComponent({
		name: 'InvitationTeam',
		i18n,
		components: {},
		setup() {
			const { accountId } = useUser();

			const { t } = useI18n(i18n);

			return {
				accountId,
				t,
			};
		},
	});
</script>
`;

	expect(clean(result1)).toEqual(clean(expectedCode1));
	expect(clean(result2)).toEqual(clean(expectedCode2));

	// Удаляем директорию после теста
	await fs.remove(folderPath);
});