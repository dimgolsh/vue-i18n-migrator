import { formatCode } from 'src/convert/formatCode';

/**
 * Normalize code by removing extra whitespace and formatting
 */
export const normalizeCode = (code: string): string => {
	// Remove empty lines
	return code
		.trim()
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.join('\n');
};

/**
 * Create a readable diff between expected and actual code
 */
export const createCodeDiff = (expected: string, actual: string): string => {
	const expectedLines = expected.split('\n');
	const actualLines = actual.split('\n');
	const diff: string[] = [];

	const maxLines = Math.max(expectedLines.length, actualLines.length);

	for (let i = 0; i < maxLines; i++) {
		const expectedLine = expectedLines[i] || '';
		const actualLine = actualLines[i] || '';

		if (expectedLine !== actualLine) {
			diff.push(`Line ${i + 1}:`, `  Expected: "${expectedLine}"`, `  Received: "${actualLine}"`, '');
		}
	}

	return diff.join('\n');
};

/**
 * Compare two pieces of code, ignoring whitespace and formatting
 */
export const compareCode = async (
	expected: string,
	actual: string,
): Promise<{ isEqual: boolean; diff?: string; normalizedExpected?: string; normalizedActual?: string }> => {
	const normalizedExpected = normalizeCode(await formatCode(expected));
	const normalizedActual = normalizeCode(await formatCode(actual));

	if (normalizedExpected === normalizedActual) {
		return { isEqual: true, normalizedExpected, normalizedActual };
	}

	return {
		isEqual: false,
		diff: createCodeDiff(normalizedExpected, normalizedActual),
		normalizedExpected,
		normalizedActual,
	};
};

export const clean = (str: string) => str.replace(/\s+/g, '');

export const cleanNewLines = (str: string) => str.replace(/\n/g, '');
