import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import Button from 'components/inputs/ButtonDefault';

type Props = {
	buttonText: string;
} & WrappedFieldProps;

export default ({ buttonText, ...rest }: Props) => (
	<Button type="button" {...rest}>
		{buttonText}
	</Button>
);
