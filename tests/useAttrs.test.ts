import { expect, test } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';

test('Add useAttrs and import to script setup', async () => {
	const code = `
    <script lang="ts">
      export default {
        setup(_, { attrs }) {
					return {
						attrs
					}
        }
      };
    </script>
  `;

	const resultCode = `
<script setup lang="ts">
import { useAttrs } from 'vue';

const attrs = useAttrs();
</script>`;

	const { content } = await convert(code);

	expect(clean(content)).toEqual(clean(resultCode));
});
