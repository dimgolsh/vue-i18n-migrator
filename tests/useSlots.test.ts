import { expect, test } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';

test('Add useSlots and import to script setup', async () => {
	const code = `
    <script lang="ts">
      export default {
        setup(_, { slots }) {
					return {
						slots
					}
        }
      };
    </script>
  `;

	const resultCode = `
<script setup lang="ts">
import { useSlots } from 'vue';

const slots = useSlots();
</script>`;

	const { content } = await convert(code);

	expect(clean(content)).toEqual(clean(resultCode));
});
