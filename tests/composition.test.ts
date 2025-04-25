import { convert } from '../src/convert';
import { expect, it, describe } from 'vitest';
import { compareCode } from './utils';

describe('composition', () => {
	it('should convert with empty setup', async () => {
		const input = `
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
</script>`;

		const expected = `
<template>
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
			const { t } = useI18n(i18n);

			return {
				t,
			};
		},
	});
</script>
`;

		const result = await convert(input, { legacy: true });
		expect(result.isOk).toBe(true);

		const comparison = await compareCode(expected, result.content);

		expect(comparison.normalizedActual).toBe(comparison.normalizedExpected);
	});
});
