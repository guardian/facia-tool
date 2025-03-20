import { styled } from 'constants/theme';
import React, { ReactElement } from 'react';
import { WrappedFieldMetaProps, WrappedFieldInputProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { theme } from 'constants/theme';

const radioButtonHeight = 17;
const radioButtonWidth = 17;

const RadioButtonContainer = styled.div<{ usesBlockStyling?: boolean }>`
	display: flex;
	align-items: center;
	padding: ${(props) => (props.usesBlockStyling ? '8px 6px' : '0')};
	background-color: ${(props) => (props.usesBlockStyling ? '#CCCCCC' : 'none')};
	height: ${(props) =>
		props.usesBlockStyling ? `${radioButtonHeight * 2}px` : 'auto'};
	color: ${(props) => props.theme.input.colorLabel};
	cursor: pointer;
	&:has(input:checked) {
		color: ${(props) => (props.usesBlockStyling ? 'white' : 'auto')};
		background-color: ${(props) =>
			props.usesBlockStyling ? '#A9A9A9' : 'none'};
	}
	&:has(input:disabled) {
		opacity: 0.8;
		cursor: not-allowed;
	}
`;

const Label = styled(InputLabel)`
	padding-left: 5px;
	line-height: 15px;
	flex: 1;
	cursor: inherit;
`;

const Switch = styled.div`
	position: relative;
	width: ${radioButtonWidth}px;
	margin-left: auto;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
`;

const RadioButtonLabel = styled.label`
	display: block;
	overflow: hidden;
	cursor: pointer;
	height: ${radioButtonHeight}px;
	padding: 0;
	line-height: ${radioButtonHeight}px;
	background: ${theme.base.colors.backgroundColorFocused};
	border-radius: 50%;
	border: ${`solid 1px ${theme.input.borderColor}`};
	position: relative;
	/* Check mark */
	&:after {
		position: absolute;
		display: none;
		content: ' ';
		top: 2px;
		left: 2px;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background-color: ${theme.base.colors.highlightColor};
		margin: 0px;
	}
`;

const RadioButton = styled.input`
	display: none;
	:checked + ${RadioButtonLabel} {
		border-radius: 50%;
		border: solid 1px ${theme.base.colors.radioButtonSelected};
	}
	&:checked + ${RadioButtonLabel}:after {
		display: block;
	}
	&:hover:not(:checked):not([disabled]) + ${RadioButtonLabel}:after {
		display: block;
	}

	&:disabled + ${RadioButtonLabel} {
		pointer-events: none;
		opacity: 0.6;
		background: ${theme.input.radioButtonBackgroundDisabled};
	}
	&:disabled + ${RadioButtonLabel}:after {
		background-color: ${theme.colors.greyMedium};
	}
`;

const IconContainer = styled.div`
	width: 20px;
	margin-left: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

type Props = {
	label?: string;
	id: string;
	dataTestId?: string;
	usesBlockStyling?: boolean;
	checked?: boolean;
	icon?: ReactElement;
} & {
	input: Pick<WrappedFieldInputProps, 'onChange'> &
		Partial<WrappedFieldInputProps>;
	meta?: WrappedFieldMetaProps;
};

export default ({
	label,
	id,
	dataTestId,
	input: { ...inputRest },
	checked,
	icon = undefined,
	usesBlockStyling = false,
	...rest
}: Props) => (
	<>
		<InputContainer data-testid={dataTestId}>
			<RadioButtonContainer usesBlockStyling={usesBlockStyling}>
				<Switch>
					<RadioButton
						type="radio"
						{...inputRest}
						checked={checked}
						{...rest}
						id={id}
					/>
					<RadioButtonLabel htmlFor={id} />
				</Switch>
				<Label htmlFor={id} size="sm">
					{label}
				</Label>
				{icon !== undefined ? <IconContainer>{icon}</IconContainer> : null}
			</RadioButtonContainer>
		</InputContainer>
	</>
);
