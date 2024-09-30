import {
	CommonFieldProps,
	WrappedFieldProps,
	Formatter,
	Normalizer,
	Parser,
	Validator,
	GenericFieldHTMLAttributes,
} from 'redux-form';
import { ComponentType, Component } from 'react';

declare module 'redux-form' {
	interface BaseFieldProps<P = {}> extends Partial<CommonFieldProps> {
		name: string;
		// Any-typed to avoid a known issue, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26253
		component?:
			| ComponentType<WrappedFieldProps & any>
			| 'input'
			| 'select'
			| 'textarea';
		format?: Formatter | null;
		normalize?: Normalizer;
		props?: P;
		parse?: Parser;
		validate?: Validator | Validator[];
		warn?: Validator | Validator[];
		withRef?: boolean;
		immutableProps?: string[];
		[attr: string]: any;
	}
}
