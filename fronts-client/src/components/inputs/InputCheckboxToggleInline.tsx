import { styled } from 'constants/theme';
import React from 'react';
import { WrappedFieldMetaProps, WrappedFieldInputProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { theme } from 'constants/theme';

const checkboxHeight = 17;
const checkboxWidth = 28;

const CheckboxContainer = styled.div`
	display: flex;
	align-items: flex-start;
`;

const Label = styled(InputLabel)`
	padding-left: 5px;
	color: ${(props) => props.theme.input.colorLabel};
	line-height: 15px;
	flex: 1;
	cursor: pointer;
`;

const Switch = styled.div`
	position: relative;
	width: ${checkboxWidth}px;
	margin-left: auto;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
`;

const CheckboxLabel = styled.label`
	display: block;
	overflow: hidden;
	cursor: pointer;
	height: ${checkboxHeight}px;
	padding: 0;
	line-height: ${checkboxHeight}px;
	border: 2px solid ${theme.input.checkboxBorderColor};
	border-radius: ${checkboxHeight}px;
	background-color: ${theme.input.checkboxBorderColor};
	transition: background-color 0.1s ease-in;
	:before {
		content: '';
		display: block;
		width: ${checkboxHeight}px;
		height: ${checkboxHeight}px;
		margin: 0px;
		background: ${theme.input.checkboxColorInactive};
		position: absolute;
		top: 0;
		bottom: 0;
		right: 11px;
		border: 2px solid ${theme.input.checkboxBorderColor};
		border-radius: ${checkboxHeight}px;
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
				<Label htmlFor={id} size="sm">
					{label}
				</Label>
			</CheckboxContainer>
		</InputContainer>
	</>
);
