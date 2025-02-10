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
		<template><div></div></template>
    <script lang="ts">
      export default {
        name: 'TestComponent',
        setup() {
          return {};
        },
      };
    </script>
  `,
		'utf-8',
	);

	await execa('./dist/cli.js', ['single', filePath]);

	const result = fs.readFileSync(filePath, 'utf-8');

	const expectedCode = `<script setup lang="ts">
defineOptions({
name: 'TestComponent',
});
</script>
<template><div></div></template>
`;

	expect(clean(result)).toEqual(clean(expectedCode));

	// Чистим файлы после теста
	await fs.remove(filePath);
	await fs.remove(outputPath);
});

test('Test rejects checkCompositionApi', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');

	await fs.writeFile(
		filePath,
		`
		<template><div></div></template>
    <script lang="ts">
      export default {
        name: 'TestComponent',
        setup() {
          return {};
        },
      };
    </script>
  `,
		'utf-8',
	);

	await expect(execa('./dist/cli.js', ['check-composition-api', filePath])).rejects.toThrow(
		'Composition API is not supported',
	);
});

test('Test checkCompositionApi', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');

	await fs.writeFile(
		filePath,
		`
		<template><div></div></template>
    <script setup lang="ts">
      
    </script>
  `,
		'utf-8',
	);

	await expect(execa('./dist/cli.js', ['check-composition-api', filePath])).not.rejects;
});

test('CLI convert all files in folder', async () => {
	const folderPath = path.resolve(__dirname, 'test-folder');
	await fs.ensureDir(folderPath);

	await fs.writeFile(
		path.join(folderPath, 'file1.vue'),
		`
    <script lang="ts">
      export default {
        name: 'TestComponent1',
        setup() {
          return {};
        }
      };
    </script>
  `,
	);

	await fs.writeFile(
		path.join(folderPath, 'file2.vue'),
		`
    <script lang="ts">
      export default {
        name: 'TestComponent2',
        setup() {
          return {};
        }
      };
    </script>
  `,
	);

	// Запускаем CLI
	await execa('./dist/cli.js', ['folder', folderPath]);

	const result1 = await fs.readFile(path.join(folderPath, 'file1.vue'), 'utf-8');
	const result2 = await fs.readFile(path.join(folderPath, 'file2.vue'), 'utf-8');

	const expectedCode1 = `<script setup lang="ts">
defineOptions({
name: 'TestComponent1',
});
</script>`;

	const expectedCode2 = `<script setup lang="ts">
defineOptions({
name: 'TestComponent2',
});
</script>`;

	expect(clean(result1)).toEqual(clean(expectedCode1));
	expect(clean(result2)).toEqual(clean(expectedCode2));

	// Удаляем директорию после теста
	await fs.remove(folderPath);
});
