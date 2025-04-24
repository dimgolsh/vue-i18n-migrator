# Vue I18n Migrator

![GitHub License](https://img.shields.io/github/license/dimgolsh/vue-i18n-migrator)
![GitHub package.json version](https://img.shields.io/github/package-json/v/dimgolsh/vue-i18n-migrator)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dimgolsh/vue-i18n-migrator/test.yml)

[Demo](https://dimgolsh.github.io/vue-i18n-migrator/)

vue-i18n-migrator is a tool designed to help migrate Vue 2 i18n syntax to Vue 3 Composition API i18n syntax. Available both as a command-line tool and a web interface, it automates the transformation process, making your internationalization code cleaner and compatible with Vue 3.

## Web Version Features

The web version provides an interactive interface for converting i18n code:
- Real-time conversion preview
- Code sharing via URL (your code is compressed and stored in the URL)
- Reset to default example with one click
- Syntax highlighting and error reporting
- No server-side processing - all conversions happen in your browser

Try it out at [Demo](https://dimgolsh.github.io/vue-i18n-migrator/)

## CLI Features

### Supported Transformations

- [x] Convert template syntax
  - [x] `$t` to `t`
  - [x] `$tc` to `t`
  - [x] `$n` to `n`
  - [x] `$d` to `d`
  
- [x] Convert script syntax
  - [x] Add `useI18n` import
  - [x] Remove i18n option from component
  - [x] Add i18n composition function call
  - [x] Handle existing i18n usage

### Supported Contexts

- [x] Template interpolation (`{{ $t('key') }}` → `{{ t('key') }}`)
- [x] Template attributes (`:title="$t('key')"` → `:title="t('key')"`)
- [x] v-bind object syntax (`v-bind="{ title: $t('key') }"` → `v-bind="{ title: t('key') }"`)
- [x] Dynamic components (`:is="$t('key')"` → `:is="t('key')"`)
- [x] Regular attributes (`title="$t('key')"` → `title="t('key')"`)

## Requirements

- Web version: Any modern browser
- CLI version: [Node.js > 18](https://nodejs.org/en/)
- Valid Vue file written in TypeScript (`.vue` extension)

## Usage

### Web Interface

1. Visit [Demo](https://dimgolsh.github.io/vue-i18n-migrator/)
2. Paste your Vue 2 i18n code in the left editor
3. See the converted Vue 3 i18n code in the right editor
4. Share your code by copying the URL
5. Use the "Reset to Default" button to return to the example code

### CLI

#### Install

```bash
# npm
npm i vue-i18n-migrator
```

#### API

The CLI provides several commands for different use cases:

##### Convert Commands

```bash
# Convert a single file
npx vue-i18n-migrator single [options] <vue file path>

# Convert all files in a directory
npx vue-i18n-migrator folder <folder path>

# Example:
npx vue-i18n-migrator folder "src/components/users/"
```

##### Check Commands

```bash
# Check a single file for deprecated i18n usage
npx vue-i18n-migrator check-vue-i18n <vue file path>

# Check all files in a directory for deprecated i18n usage
npx vue-i18n-migrator check-vue-i18n-folder <folder path>

# Examples:
npx vue-i18n-migrator check-vue-i18n "src/components/users/UserProfile.vue"
npx vue-i18n-migrator check-vue-i18n-folder "src/components/users/"
```

The check commands will output warnings if they find:
- Deprecated i18n syntax in templates ($t, $tc, $n, $d)
- Missing useI18n() calls in components
- Incorrect i18n implementation

#### Options
```
-v, --view             Preview changes in the editor
-l, --legacy          Enable legacy mode for components that still need i18n instance
-h, --help             Help for vue-i18n-migrator
```

Example:
```bash
# Convert with legacy mode enabled
npx vue-i18n-migrator single --legacy "src/components/HelloWorld.vue"
```

## How It Works

The tool operates in two modes:

### Browser Mode
```
Vue code -> Parser (SFC) -> @babel/parse AST -> I18n transform (@babel/traverse) -> 
Generate @babel/generator -> Format with Prettier standalone
```

### CLI Mode
```
Read file -> Vue code -> Parser (SFC) -> @babel/parse AST -> I18n transform (@babel/traverse) -> 
Generate @babel/generator -> Format with Prettier standalone -> Format with Prettier API -> Write file
```

The tool performs the following steps:

1. Parse Vue Files: Reads the content of the Vue files and parses to AST with Babel
2. Detect I18n Usage: Analyzes the template and script for i18n function calls
3. Transform Template: Converts template i18n syntax ($t, $tc, $n, $d) to composition API syntax
4. Transform Script: Adds useI18n import and call, removes i18n option
5. Code Formatting: Automatically formats the converted code using Prettier

### Useful Links
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [Vue I18n Migration Guide](https://vue-i18n.intlify.dev/guide/migration/breaking.html)
- [AST Explorer](https://astexplorer.net/)

### License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides a comprehensive overview of your project, explaining how to install, use, and understand its functionality. You can customize the repository link and other specifics as needed.

### Legacy Mode

Legacy mode is designed for gradual migration scenarios where you need to maintain compatibility with components that still require the i18n instance. When enabled:

- Preserves the i18n instance in component options
- Keeps the i18n import statement
- Still converts template syntax to composition API style
- Adds useI18n with the i18n instance

Example of legacy mode conversion:

```vue
<!-- Before -->
<script setup lang="ts">
import i18n from './i18n';
defineOptions({ name: 'MyComponent', i18n });
</script>
<template>
  <div>{{ $t('hello') }}</div>
</template>

<!-- After (with --legacy flag) -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import i18n from './i18n';

defineOptions({
  name: 'MyComponent',
  i18n
});

const { t } = useI18n(i18n);
</script>
<template>
  <div>{{ t('hello') }}</div>
</template>
```
