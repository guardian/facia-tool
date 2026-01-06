import styled from 'styled-components';
import InputBase from './InputBase';
import { WrappedFieldInputProps } from 'redux-form';
import React from 'react';

type Props = {
	input: Pick<WrappedFieldInputProps, 'onChange'> &
		Partial<WrappedFieldInputProps>;
};

const StyledVideoUriInput = styled(InputBase)`
	border: none;
	:focus,
	:active {
		border: none;
	}
	::placeholder {
		font-size: 12px;
	}
`;

export const VideoUriInput = ({
	input: { onChange, ...inputRest },
	...rest
}: Props) => (
	<StyledVideoUriInput onChange={onChange} {...inputRest} {...rest} />
);
