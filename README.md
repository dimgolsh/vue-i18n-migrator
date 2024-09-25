# Vue Composition API to Setup (AST)

![NPM License](https://img.shields.io/npm/l/vue-comp-to-setup)
![NPM Version](https://img.shields.io/npm/v/vue-comp-to-setup)


[Demo](https://dimgolsh.github.io/vue-comp-to-setup/)

vue-comp-to-setup is a command-line tool designed to convert Vue files written using the Composition API into the more modern Script Setup syntax. This tool automates the transformation process, making your code cleaner, easier to maintain, 
and aligned with the latest Vue.js best practices.

Features

	•	Converts Composition API-based Vue files to Script Setup syntax.
	•	Handles both single files and entire directories.
	•	Automatically updates defineProps, defineEmits, and defineOptions.
	•	Cleans up imports and adjusts the structure of your components.

## Usage
The vue-comp-to-setup project has CLI

Install locally or global
```bash
# npm
npm i vue-comp-to-setup
```

### CLI

#### Convert a Single File

To convert a single .vue file, run:
```bash
# npm
# convert single vue file
npx vue-comp-to-setup single [cliOptions] <vue file path>
```

#### Options
```
-v, --view             Preview changes in the editor.
-h, --help             Help for vue-comp-to-setup
```
Example:
```bash
# npm
# convert single vue file
npx vue-comp-to-setup single "src/components/HelloWorld.vue"
```

Example output
```bash
✔ Successfully converted file: src/components/HelloWorld.vue
```

### Convert All Files in a Directory

To convert all .vue files in a specified directory, run:

```bash
# npm
# convert folder
npx vue-comp-to-setup folder <folder dir path>
```

## How It Works

Browser: Vue code -> Parser (SFC) -> @babel/parse AST -> Script Setup transform (@babel/traverse) -> Generate @babel/generator -> Format with Prettier standalone

CLI: Read file -> Vue code -> Parser (SFC) -> @babel/parse AST -> Script Setup transform (@babel/traverse) -> Generate @babel/generator -> Format with Prettier standalone -> Format with Prettier API -> Write file

The tool performs the following steps:

	1.	Parse Vue Files: Reads the content of the Vue files and parse to AST with Babel.
	2.	Convert to Script Setup: Extracts props, emits, and options (like component name and i18n) and converts them into Script Setup syntax (defineProps, defineEmits, defineOptions).
	3.	Clean Up Imports: Removes unnecessary imports such as defineComponent and adjusts the remaining imports as needed.
	4.	Rewrite Setup Content: Extracts the content inside the setup function and refactors it according to Script Setup syntax, removing return statements.
	5.	Code Formatting: Automatically formats the converted code using Prettier.


### License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides a comprehensive overview of your project, explaining how to install, use, and understand its functionality. You can customize the repository link and other specifics as needed.
