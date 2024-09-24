# Vue Composition API to Setup


[Demo](https://dimgolsh.github.io/vue-comp-to-setup/)

vue-comp-to-setup is a command-line tool designed to convert Vue files written using the Composition API into the more modern Script Setup syntax. This tool automates the transformation process, making your code cleaner, easier to maintain, 
and aligned with the latest Vue.js best practices.

Features

	•	Converts Composition API-based Vue files to Script Setup syntax.
	•	Handles both single files and entire directories.
	•	Automatically updates defineProps, defineEmits, and defineOptions.
	•	Cleans up imports and adjusts the structure of your components.

## Usage
The vue-comp-to-setup project has both CLI and API interface.

### CLI
```bash
# npm
npx vue-comp-to-setup single [cliOptions] <vue file path>
```

#### Options
```
-v, --view             Preview changes in the editor.
-h, --help             Help for vue-comp-to-setup
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides a comprehensive overview of your project, explaining how to install, use, and understand its functionality. You can customize the repository link and other specifics as needed.
