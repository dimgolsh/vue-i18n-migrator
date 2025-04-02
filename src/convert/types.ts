export interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export enum BlockOrder {
	SetupTemplateStyle = 'SetupTemplateStyle',
	TemplateSetupStyle = 'TemplateSetupStyle',
}

export enum PropsStyle {
	WithDefaults = 'WithDefaults',
	DefinePropsOptions = 'DefinePropsOptions',
	ReactivityProps = 'ReactivityProps',
}

export interface ConvertOptions {
	// @deprecated
	propsOptionsLike: boolean;
	blockOrder?: BlockOrder;
	propsStyle?: PropsStyle;
}

export interface ConvertFileOptions extends ConvertOptions {
	view: boolean;
}
