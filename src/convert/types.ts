export interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export enum BlockOrder {
	SetupTemplateStyle = 'SetupTemplateStyle',
	TemplateSetupStyle = 'TemplateSetupStyle',
}

export interface ConvertOptions {
	// Temporary support for legacy i18n-t usage
	legacy: boolean;
}

export interface ConvertFileOptions extends ConvertOptions {
	view: boolean;
}
