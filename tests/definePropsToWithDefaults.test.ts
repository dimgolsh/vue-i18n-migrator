import { expect, test } from 'vitest';
import { clean } from './utils';
import { definePropsToWithDefaults } from '../src/convert/utils/definePropsToWithDefaults';

test('convert defineProprs to definePropsWithDefaults', async () => {
	const code = `
   const props = defineProps({
	tooltipText: {
		type: String,
		default: '',
	},
	injectKey: {
		type: [String, Number],
		default: '',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	hideTooltip: {
		type: Boolean,
		default: false,
	},
	defaultPromptText: {
		type: String,
		default: '',
	},
});
  `;

	const resultCode = `
const props = withDefaults(defineProps<{
   tooltipText?: string;
   injectKey?: string | number;
   disabled?: boolean;
   hideTooltip?: boolean;
   defaultPromptText?: string;
 }>(), {
   tooltipText: '',
   injectKey: '',
   disabled: false,
   hideTooltip: false,
   defaultPromptText: ''
 });
`;

	const { content } = await definePropsToWithDefaults(code);

	expect(clean(content)).toEqual(clean(resultCode));
});
