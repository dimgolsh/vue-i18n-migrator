export interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}


export interface ConvertOptions {
	propsOptionsLike: boolean
}


export interface ConvertFileOptions extends ConvertOptions{
	view: boolean;
}
