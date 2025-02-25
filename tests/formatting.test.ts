import { test, expect } from 'vitest';
import { convert } from '../src';

test('should add blank line between script, template, style', async () => {
	const code = `<script lang=ts>
	export default defineComponent({
		setup() {
			return {
				msg: 'Hello',
			};
		}
	});
</script>
<template>
<div>{{ msg }}</div>
</template>
<style>
.msg { color: blue; }
</style>`;

	const expected = `<script setup lang="ts">\r\n	const msg = 'Hello';\r\n</script>\r\n\r\n<template>\r\n	<div>{{ msg }}</div>\r\n</template>\r\n\r\n<style>\r\n	.msg { color: blue; }\r\n</style>\r\n`;

	const { content } = await convert(code);

	expect(content).toEqual(expected);
});

test('should add blank line between template, script, style', async () => {
	const code = `<template>
<div>{{ msg }}</div>
</template>
<script lang=ts>
	export default defineComponent({
		setup() {
			return {
				msg: 'Hello',
			};
		}
	});
</script>
<style>
.msg { color: blue; }
</style>`;

	const expected = `<script setup lang="ts">\r\n	const msg = 'Hello';\r\n</script>\r\n\r\n<template>\r\n	<div>{{ msg }}</div>\r\n</template>\r\n\r\n<style>\r\n	.msg { color: blue; }\r\n</style>\r\n`;

	const { content } = await convert(code);

	expect(content).toEqual(expected);
});

test('should add blank line between script and template', async () => {
	const code = `<script lang=ts>
	export default defineComponent({
		setup() {
			return {
				msg: 'Hello',
			};
		}
	});
</script>
<template>
<div>{{ msg }}</div>
</template>`;

	const expected = `<script setup lang="ts">\r\n	const msg = 'Hello';\r\n</script>\r\n\r\n<template>\r\n	<div>{{ msg }}</div>\r\n</template>\r\n`;

	const { content } = await convert(code);

	expect(content).toEqual(expected);
});

test('should add blank line between script and style', async () => {
	const code = `<script lang=ts>
	export default defineComponent({
		setup() {
			return {
				msg: 'Hello',
			};
		}
	});
</script>
<style>
.msg { color: blue; }
</style>`;

	const expected = `<script setup lang="ts">\r\n	const msg = 'Hello';\r\n</script>\r\n\r\n<style>\r\n	.msg { color: blue; }\r\n</style>\r\n`;

	const { content } = await convert(code);

	expect(content).toEqual(expected);
});
