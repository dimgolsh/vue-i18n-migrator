
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
  