import { styled } from 'constants/theme';
import React from 'react';
import { WrappedFieldMetaProps, WrappedFieldInputProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { theme } from 'constants/theme';
import { ConicalFlaskIcon } from '../icons/Icons';

const checkboxHeight = 17;
const checkboxWidth = 28;

const CheckboxContainer = styled.div<{ useABTestStyling?: boolean }>`
	display: flex;
	align-items: center;
	flex-direction: ${(props) =>
		props.useABTestStyling ? 'row-reverse' : 'row'};
	gap: 5px;

	&:has(input:disabled) label {
		cursor: not-allowed;
	}
`;

const Label = styled(InputLabel)<{
	useABTestStyling?: boolean;
	activeABTest?: boolean;
}>`
	color: ${(props) =>
		props.useABTestStyling && props.activeABTest
			? props.theme.input.abTestActiveColor
			: props.theme.input.colorLabel};
	line-height: 15px;
	flex: 1;
	cursor: pointer;
`;

const LabelContainer = styled.div`
	display: flex;
	gap: 2px;
	align-items: center;
	flex: 1 1 0%;
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

const Checkbox = styled.input<{ useABTestStyling?: boolean }>`
	display: none;
	:checked + ${CheckboxLabel} {
		background-color: ${({ useABTestStyling }) =>
			useABTestStyling
				? theme.input.abTestActiveColor
				: theme.input.checkboxColorActive};
	}
	&:checked + ${CheckboxLabel}, &:checked + ${CheckboxLabel}:before {
		border-color: ${({ useABTestStyling }) =>
			useABTestStyling
				? theme.input.abTestActiveColor
				: theme.input.checkboxColorActive};
		right: 0px;
	}
	:disabled,
	:disabled + ${CheckboxLabel}, :disabled + ${CheckboxLabel}:before {
		cursor: not-allowed;
	}
	:disabled + ${CheckboxLabel}:before {
		background-color: ${theme.input.checkboxButtonBackgroundDisabled};
	}
	:disabled + ${Label} {
		cursor: not-allowed;
	}
`;

type Props = {
	label?: string;
	id: string;
	dataTestId?: string;
	useABTestStyling?: boolean;
	activeABTest?: boolean;
	theme: any;
} & {
	input: Pick<WrappedFieldInputProps, 'onChange'> &
		Partial<WrappedFieldInputProps>;
	meta?: WrappedFieldMetaProps;
};

export default ({
	label,
	id,
	dataTestId,
	useABTestStyling,
	activeABTest,
	input: { onChange, ...inputRest },
	...rest
}: Props) => (
	<>
		<InputContainer data-testid={dataTestId}>
			<CheckboxContainer useABTestStyling={useABTestStyling}>
				<Switch>
					<Checkbox
						type="checkbox"
						onChange={() => onChange(!inputRest.checked)}
						{...inputRest}
						{...rest}
						id={id}
						useABTestStyling={useABTestStyling}
					/>
					<CheckboxLabel htmlFor={id} />
				</Switch>
				<LabelContainer>
					{useABTestStyling && (
						<ConicalFlaskIcon
							size={'xs'}
							fill={
								activeABTest
									? theme.input.abTestActiveColor
									: theme.input.colorLabel
							}
						/>
					)}
					<Label
						htmlFor={id}
						size="sm"
						useABTestStyling={useABTestStyling}
						activeABTest={activeABTest}
					>
						{label}
					</Label>
				</LabelContainer>
			</CheckboxContainer>
		</InputContainer>
	</>
);
