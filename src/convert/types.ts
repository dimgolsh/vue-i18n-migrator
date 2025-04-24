export interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export enum BlockOrder {
	SetupTemplateStyle = 'SetupTemplateStyle',
	TemplateSetupStyle = 'TemplateSetupStyle',
}

export enum ConvertError {
	AlreadyConverted = '⚠ Vue file is already converted',
	NoScript = '⚠ Vue file must contain either script or script setup',
	ParseError = '⚠ Error parsing Vue file - empty file?',
}

export interface ConvertOptions {
	// Temporary support for legacy i18n-t usage
	legacy: boolean;
}

export interface ConvertFileOptions extends ConvertOptions {
	view: boolean;
}
