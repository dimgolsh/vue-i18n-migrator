import './userWorker';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { convert } from './convert';
// @ts-ignore
import code from './demo.txt?raw';
// @ts-ignore
import codeProps from './demoProps.txt?raw';
// @ts-ignore
import codeWithDefaults from './demoWithDefaultsProps.txt?raw';
import { BlockOrder, ConvertOptions, PropsStyle } from './convert/types';
import { definePropsToWithDefaults } from './convert/utils/definePropsToWithDefaults';
import { withDefaultsPropsToReactivityProps } from './convert/utils/withDefaultsPropsToReactivity';

enum Converter {
	VueCompToSetup = 'vue-comp-to-setup',
	VueDefinePropsToWithDefaults = 'vue-defineProps-to-withDefaults',
	VueWithDefaultsPropsToReactivityProps = 'vue-withDefaults-props-to-reactivity-props',
}

let currentConverter = Converter.VueCompToSetup;

const convertWithCurrentConverter = async (code: string, options: ConvertOptions) => {
	if (currentConverter === Converter.VueDefinePropsToWithDefaults) {
		return definePropsToWithDefaults(code);
	}

	if (currentConverter === Converter.VueWithDefaultsPropsToReactivityProps) {
		return withDefaultsPropsToReactivityProps(code);
	}

	return convert(code, options);
};

const init = async () => {
	const editor = monaco.editor.create(document.getElementById('editor')!, {
		value: code,
		language: 'html',
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
	});

	const options: ConvertOptions = {
		propsOptionsLike: false,
		blockOrder: BlockOrder.SetupTemplateStyle,
		propsStyle: PropsStyle.WithDefaults,
	};
	const val = await convertWithCurrentConverter(code, options);

	const output = monaco.editor.create(document.getElementById('output'), {
		value: val.content,
		language: 'html',
		theme: 'vs-dark',
	});

	const setOutput = async () => {
		try {
			const val = await convertWithCurrentConverter(editor.getValue(), options);
			if (val.isOk) {
				output.setValue(val.content as string);
			} else {
				output.setValue((val.content as string) + val.errors.join('\n'));
			}

			// eslint-disable-next-line no-empty
		} catch (error) {
			console.error(error);
		}
	};

	editor.onDidChangeModelContent(() => {
		setOutput()
			.then((res) => res)
			.catch(() => {
				console.error('Error');
			});
	});

	const selectConverter = document.getElementById('selectConverter') as HTMLSelectElement;
	const orderSelector = document.getElementById('blockOrder') as HTMLSelectElement;
	const propsStyleSelector = document.getElementById('propsStyle') as HTMLSelectElement;

	selectConverter.addEventListener('change', (e) => {
		const value = (e.target as HTMLSelectElement).value;
		currentConverter = value as Converter;

		if (currentConverter === Converter.VueDefinePropsToWithDefaults) {
			editor.setValue(codeProps);
		} else if (currentConverter === Converter.VueWithDefaultsPropsToReactivityProps) {
			editor.setValue(codeWithDefaults);
		} else {
			editor.setValue(code);
		}
		setOutput();
	});

	orderSelector.addEventListener('change', (e) => {
		console.log((e.target as HTMLSelectElement).value);
		options.blockOrder = (e.target as HTMLSelectElement).value as BlockOrder;
		setOutput();
	});

	propsStyleSelector.addEventListener('change', (e) => {
		options.propsStyle = (e.target as HTMLSelectElement).value as PropsStyle;
		setOutput();
	});
};

init();
