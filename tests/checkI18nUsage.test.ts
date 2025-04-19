import { checkI18nUsage } from 'src/convert/template';
import { describe, expect, it } from 'vitest';

describe('i18n usage detection', () => {
	it('should detect t usage', () => {
		const template = `
			<template>
				<div>{{ $t('hello') }}</div>
			</template>
		`;

		const usage = checkI18nUsage(template);
		expect(usage.t).toBe(true);
		expect(usage.tc).toBe(false);
		expect(usage.n).toBe(false);
		expect(usage.d).toBe(false);
	});

	it('should detect multiple i18n functions', () => {
		const template = `
			<template>
				<div>
					<p>{{ $t('hello') }}</p>
					<p>{{ $d(date, 'long') }}</p>
					<p>{{ $n(42) }}</p>
					<p>{{ $tc('items', count) }}</p>
				</div>
			</template>
		`;

		const usage = checkI18nUsage(template);
		expect(usage.t).toBe(true);
		expect(usage.tc).toBe(true);
		expect(usage.n).toBe(true);
		expect(usage.d).toBe(true);
	});

	it('should detect i18n functions in attributes', () => {
		const template = `
			<template>
				<div :title="$t('tooltip')" :aria-label="$n(count)">
					<input :placeholder="$d(date)" />
				</div>
			</template>
		`;

		const usage = checkI18nUsage(template);
		expect(usage.t).toBe(true);
		expect(usage.d).toBe(true);
		expect(usage.n).toBe(true);
		expect(usage.tc).toBe(false);
	});

	it('should handle empty template', () => {
		const template = '';
		const usage = checkI18nUsage(template);
		expect(usage.t).toBe(false);
		expect(usage.tc).toBe(false);
		expect(usage.n).toBe(false);
		expect(usage.d).toBe(false);
	});
});
