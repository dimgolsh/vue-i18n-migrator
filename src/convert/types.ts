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
	propsOptionsLike: boolean;
	blockOrder?: BlockOrder;
}

export interface ConvertFileOptions extends ConvertOptions {
	view: boolean;
}
