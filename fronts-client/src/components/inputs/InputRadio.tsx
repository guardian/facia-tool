import { styled, css } from 'constants/theme';
import React, { ReactElement } from 'react';
import { WrappedFieldMetaProps, WrappedFieldInputProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { theme } from 'constants/theme';

const radioButtonHeight = 17;
const radioButtonWidth = 17;

const InnerContainer = styled.div`
	display: flex;
	align-items: center;
`;

const Row = styled.div`
	display: flex;
	width: 100%;
	gap: 4px;
	align-items: center;
`;
const BlockStylingMixin = () => css`
	width: 170px;
	display: flex;
	flex-direction: column;
	padding: 8px 5px;
	background-color: #cccccc;
	&:has(input:checked) {
		color: white;
		background-color: #a9a9a9;
		box-shadow: 0px 0px 0 2px ${theme.colors.orangeLight};
	}
	&:has(input:disabled) {
		opacity: 0.8;
		cursor: not-allowed;
	}
	&:has(input:disabled):hover {
		box-shadow: none;
	}
	&:hover {
		box-shadow: 0px 0px 0 2px ${theme.colors.orangeLight};
	}
`;

const Label = styled(InputLabel)<{ usesBlockStyling?: boolean }>`
	line-height: 15px;
	flex: 1;
	cursor: pointer;
	width: min-content;
	padding: 0;
	color: ${(props) => props.theme.input.colorLabel};
	${(props) => props.usesBlockStyling && BlockStylingMixin}
`;

const Switch = styled.div`
	position: relative;
	width: ${radioButtonWidth}px;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
`;

const RadioButtonLabel = styled.label`
	display: block;
	overflow: hidden;
	cursor: pointer;
	width: ${radioButtonWidth}px;
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
	display: flex;
	justify-content: center;
	align-items: center;
`;

type Props = {
	label?: string;
	id: string;
	dataTestId?: string;
	checked?: boolean;
	icon?: ReactElement;
	contents?: ReactElement;
	usesBlockStyling?: boolean;
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
	contents = undefined,
	usesBlockStyling = false,
	...rest
}: Props) => {
	const checkedProps: Record<string, boolean> = {};
	/**
	 * We use the checked property when we want to manually control the state of the radio button.
	 * If checked is undefined, it will not be passed to the input element, and the button will
	 * fall back to its default behaviour.
	 */
	if (checked !== undefined) {
		checkedProps['checked'] = checked;
	}

	return (
		<>
			<InputContainer data-testid={dataTestId}>
				<Label htmlFor={id} size="sm" usesBlockStyling={usesBlockStyling}>
					<InnerContainer>
						<Row>
							<Switch>
								<RadioButton
									type="radio"
									{...inputRest}
									{...checkedProps}
									{...rest}
									id={id}
								/>
								<RadioButtonLabel htmlFor={id} />
							</Switch>
							{label}
						</Row>
						{icon !== undefined ? <IconContainer>{icon}</IconContainer> : null}
					</InnerContainer>
					{contents !== undefined ? contents : null}
				</Label>
			</InputContainer>
		</>
	);
};
