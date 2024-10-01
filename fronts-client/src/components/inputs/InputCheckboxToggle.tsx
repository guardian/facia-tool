import { styled } from 'constants/theme';
import React from 'react';
import { WrappedFieldMetaProps, WrappedFieldInputProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import HorizontalRule from '../layout/HorizontalRule';
import { theme } from 'constants/theme';

const CheckboxContainer = styled.div`
	display: flex;
`;

const Label = styled(InputLabel)`
	color: ${(props) => props.theme.base.colors.textMuted};
	flex: 1;
	cursor: pointer;
`;

const Switch = styled.div`
	position: relative;
	width: 40px;
	margin-left: auto;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
`;

const CheckboxLabel = styled.label`
	display: block;
	overflow: hidden;
	cursor: pointer;
	height: 24px;
	padding: 0;
	line-height: 24px;
	border: ${`2px solid ${theme.input.borderColor}`};
	border-radius: 24px;
	background-color: ${theme.input.checkboxColorInactive};
	transition: background-color 0.1s ease-in;
	:before {
		content: '';
		display: block;
		width: 24px;
		height: 24px;
		margin: 0px;
		background: ${theme.input.checkboxColorInactive};
		position: absolute;
		top: 0;
		bottom: 0;
		right: 16px;
		border: ${`2px solid ${theme.input.borderColor}`};
		border-radius: 24px;
		transition: all 0.1s ease-in 0s;
	}
`;

const Checkbox = styled.input`
	display: none;
	:checked + ${CheckboxLabel} {
		background-color: ${theme.input.checkboxColorActive};
	}
	&:checked + ${CheckboxLabel}, &:checked + ${CheckboxLabel}:before {
		border-color: ${theme.input.checkboxColorActive};
		right: 0px;
	}
`;

type Props = {
	label?: string;
	id: string;
	dataTestId?: string;
} & {
	input: Pick<WrappedFieldInputProps, 'onChange'> &
		Partial<WrappedFieldInputProps>;
	meta?: WrappedFieldMetaProps;
};

export default ({
	label,
	id,
	dataTestId,
	input: { onChange, ...inputRest },
	...rest
}: Props) => (
	<>
		<InputContainer data-testid={dataTestId}>
			<CheckboxContainer>
				<Label htmlFor={id} size="sm">
					{label}
				</Label>
				<Switch>
					<Checkbox
						type="checkbox"
						onChange={() => onChange(!inputRest.checked)}
						{...inputRest}
						{...rest}
						id={id}
					/>
					<CheckboxLabel htmlFor={id} />
				</Switch>
			</CheckboxContainer>
		</InputContainer>
		<HorizontalRule noMargin />
	</>
);
