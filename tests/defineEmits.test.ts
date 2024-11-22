import { test, expect } from 'vitest';
import { convert } from '../src';
import { clean } from './utils';

test('convert emits to defineEmits', async () => {
	const code = `
    <script lang="ts">
      export default {
        emits: ['update'],
        setup(props, { emit }) {
          emit('update', true);
        }
      };
    </script>
  `;

	const { content } = await convert(code);

	const expectCode = `<script setup lang="ts">
const emit = defineEmits<{(e: 'update'): void; }>();
emit('update', true);
</script>`;

	expect(clean(content)).toEqual(clean(expectCode));
});

test('convert emits to defineEmits from setup', async () => {
	const code = `
    <script lang="ts">
      export default {
        setup(props, { emit }) {
          emit('update', true);
        }
      };
    </script>
  `;

	const { content } = await convert(code);

	const expectCode = `<script setup lang="ts">
const emit = defineEmits<{(e: 'update'): void; }>();
emit('update', true);
</script>`;

	expect(clean(content)).toEqual(clean(expectCode));
});
