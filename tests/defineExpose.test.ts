import { expect, test } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';

test('Add defineExpose to script setup', async () => {
	const code = `
    <script lang="ts">
      export default {
				expose: ['update'],
      };
    </script>
  `;

	const resultCode = `
<script setup lang="ts">
defineExpose(['update']);
</script>`;

	const { content } = await convert(code);

	expect(clean(content)).toEqual(clean(resultCode));
});
