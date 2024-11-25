import { expect, test } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';
import { BlockOrder } from '../src/convert/types';

test('Setup should above template', async () => {
	const code = `
		<template><div></div></template>
    <script lang="ts">
      export default {
        props: {
          modelValue: { type: Boolean, default: false },
        },
      };
    </script>
  `;

	const resultCode = `
<script setup lang="ts">
withDefaults(defineProps<{modelValue?: boolean;}>(), {modelValue: false});
</script>
<template><div></div></template>
`;

	const { content } = await convert(code, { propsOptionsLike: false });

	expect(clean(content)).toEqual(clean(resultCode));
});

test('Setup should below template', async () => {
	const code = `
		<template><div></div></template>
    <script lang="ts">
      export default {
        props: {
          modelValue: { type: Boolean, default: false },
        },
      };
    </script>
  `;

	const resultCode = `
<template><div></div></template>
<script setup lang="ts">
withDefaults(defineProps<{modelValue?: boolean;}>(), {modelValue: false});
</script>

`;

	const { content } = await convert(code, { propsOptionsLike: false, blockOrder: BlockOrder.TemplateSetupStyle });

	expect(clean(content)).toEqual(clean(resultCode));
});
