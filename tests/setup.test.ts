import { expect, test } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';

test('Check correct return statement', async () => {
	const code = `
    <script lang="ts">
    	import { ref } from 'vue';
      export default {
        setup() {
					const checked = ref(false);
					return {
						toggleChecked: () => checked.value = !checked.value
					}
        }
      };
    </script>
  `;

	const resultCode = `
	<script setup lang="ts">
		import { ref } from 'vue';
		const checked = ref(false);
		const toggleChecked = () => checked.value = !checked.value;
	</script>`;

	const { content } = await convert(code);

	expect(clean(content)).toEqual(clean(resultCode));
});
