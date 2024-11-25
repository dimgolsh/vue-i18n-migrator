import './userWorker';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { convert } from './convert';
// @ts-ignore
import code from './demo.txt?raw';
// @ts-ignore
import codeProps from './demoProps.txt?raw';
import { BlockOrder, ConvertOptions } from './convert/types';
import { definePropsToWithDefaults } from './convert/utils/definePropsToWithDefaults';

let currentConverter = 'vue-comp-to-setup';

const convertWithCurrentConverter = async (code: string, options: ConvertOptions) => {
	if (currentConverter === 'vue-defineProps-to-withDefaults') {
		return definePropsToWithDefaults(code);
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
		} catch (error) {}
	};

	editor.onDidChangeModelContent(() => {
		setOutput()
			.then((res) => res)
			.catch(() => {
				console.error('');
			});
	});

	const checkBox = document.getElementById('propsOptionsLike') as HTMLInputElement;
	const selectConverter = document.getElementById('selectConverter') as HTMLSelectElement;
	const orderSelector = document.getElementById('blockOrder') as HTMLSelectElement;

	selectConverter.addEventListener('change', (e) => {
		const value = (e.target as HTMLSelectElement).value;
		currentConverter = value;

		if (currentConverter === 'vue-defineProps-to-withDefaults') {
			editor.setValue(codeProps);
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

	checkBox.addEventListener('change', (e) => {
		options.propsOptionsLike = (e.target as HTMLInputElement).checked;
		setOutput();
	});
};

init();
