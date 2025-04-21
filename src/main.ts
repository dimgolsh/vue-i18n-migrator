import './userWorker';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { convert } from './convert';
// @ts-ignore
import defaultCode from './demo.txt?raw';
import { ConvertOptions } from './convert/types';

const convertWithCurrentConverter = async (code: string, options: ConvertOptions) => {
	return convert(code, options);
};

// Compress and save code to URL
const saveToURL = (code: string) => {
	const compressed = btoa(encodeURIComponent(code));
	const url = new URL(window.location.href);
	url.searchParams.set('code', compressed);
	window.history.replaceState({}, '', url);
};

// Get code from URL or return default
const getCodeFromURL = (): string => {
	const url = new URL(window.location.href);
	const code = url.searchParams.get('code');
	if (code) {
		try {
			return decodeURIComponent(atob(code));
		} catch (e) {
			console.error('Failed to decode URL code', e);
			return defaultCode;
		}
	}
	return defaultCode;
};

// Create reset button
const createResetButton = (editor: monaco.editor.IStandaloneCodeEditor) => {
	const button = document.createElement('button');
	button.textContent = 'Reset to Default';
	button.style.position = 'absolute';
	button.style.top = '10px';
	button.style.right = '10px';
	button.style.zIndex = '1000';
	button.style.padding = '8px 16px';
	button.style.backgroundColor = '#1e1e1e';
	button.style.color = '#ffffff';
	button.style.border = '1px solid #454545';
	button.style.borderRadius = '4px';
	button.style.cursor = 'pointer';

	button.addEventListener('mouseover', () => {
		button.style.backgroundColor = '#2d2d2d';
	});

	button.addEventListener('mouseout', () => {
		button.style.backgroundColor = '#1e1e1e';
	});

	button.addEventListener('click', () => {
		editor.setValue(defaultCode);
		// Clear URL query parameters
		window.history.replaceState({}, '', window.location.pathname);
	});

	document.body.appendChild(button);
};

const init = async () => {
	const initialCode = getCodeFromURL();

	const options: ConvertOptions = {
		legacy: true,
	};

	const editor = monaco.editor.create(document.getElementById('editor')!, {
		value: initialCode,
		language: 'html',
		theme: 'vs-dark',
		minimap: {
			enabled: false,
		},
	});

	createResetButton(editor);

	const val = await convertWithCurrentConverter(initialCode, options);

	const output = monaco.editor.create(document.getElementById('output'), {
		value: val.content,
		language: 'html',
		theme: 'vs-dark',
	});

	const setOutput = async () => {
		try {
			const currentCode = editor.getValue();
			saveToURL(currentCode);

			const val = await convertWithCurrentConverter(currentCode, options);
			if (val.isOk) {
				output.setValue(val.content as string);
			} else {
				output.setValue((val.content as string) + val.errors.join('\n'));
			}
		} catch (error) {
			console.error(error);
		}
	};

	const legacyCheckbox = document.getElementById('legacy') as HTMLInputElement;
	legacyCheckbox.checked = options.legacy;

	editor.onDidChangeModelContent(() => {
		setOutput()
			.then((res) => res)
			.catch(() => {
				console.error('Error');
			});
	});

	legacyCheckbox.addEventListener('change', (e) => {
		options.legacy = (e.target as HTMLInputElement).checked;
		setOutput();
	});
};

init();
