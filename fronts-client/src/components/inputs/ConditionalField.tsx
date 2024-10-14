import React, { ComponentType } from 'react';
import { Field, WrappedFieldProps } from 'redux-form';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import { BaseFieldProps } from 'redux-form';

type Props = Omit<BaseFieldProps, 'component'> & {
	permittedFields?: string[];
	container?: React.ComponentType;
	component:
		| ComponentType<WrappedFieldProps & any>
		| 'input'
		| 'select'
		| 'textarea';
};

const ConditionalField = <P extends Props>(props: P) => {
	const FieldComponent = <Field {...props} />;
	const Component = props.Container ? (
		<props.Container>{FieldComponent}</props.Container>
	) : (
		FieldComponent
	);
	return (
		<ConditionalComponent
			name={props.name}
			permittedNames={props.permittedFields}
		>
			{Component}
		</ConditionalComponent>
	);
};

export default ConditionalField;
