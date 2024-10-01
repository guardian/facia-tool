import React from 'react';
import { styled, theme } from 'constants/theme';

const RadioGroup = styled.div`
	text-align: left;
	vertical-align: top;
`;

const Input = styled.input`
	position: absolute;
	z-index: -1;
	opacity: 0;
`;

const ControlIndicator = styled.div`
	position: absolute;
	top: 2px;
	left: 0;
	width: 18px;
	height: 18px;
	background: ${theme.base.colors.backgroundColorFocused};
	/* Check mark */
	&:after {
		position: absolute;
		display: none;
		content: '';
	}
`;

const ControlRadio = styled.label<{ inline?: boolean; checked?: boolean }>`
	position: relative;
	display: ${({ inline }) => (inline ? 'inline' : 'block')};
	padding: 3px 5px 0 24px;
	cursor: pointer;
	font-family: TS3TextSans;
	font-weight: ${({ checked }) => (checked ? 'bold' : 'initial')};
	font-size: 12px;

	& + & {
		margin-left: 10px;
	}

	& > ${ControlIndicator} {
		border-radius: 50%;
		border: ${`solid 1px ${theme.input.borderColor}`};
	}

	/* Checked state */
	& {
		${Input}:checked ~ ${ControlIndicator} {
			border: solid 1px ${theme.base.colors.radioButtonSelected};
		}
	}

	/* Disabled state */
	& {
		${Input}:disabled ~ ${ControlIndicator} {
			pointer-events: none;
			opacity: 0.6;
			background: ${theme.input.radioButtonBackgroundDisabled};
		}
	}

	/* Show check mark */
	& {
		${Input}:checked ~ ${ControlIndicator}:after,
    ${Input}:hover:not([disabled]) ~ ${ControlIndicator}:after {
			display: block;
		}
	}

	/* Radio button inner circle */
	& {
		${ControlIndicator}:after {
			top: 2px;
			left: 2px;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: ${theme.base.colors.highlightColor};
		}

		${Input}:hover:not(:checked) ~ ${ControlIndicator}:after {
			background-color: ${theme.base.colors.highlightColor};
		}
	}

	/* Disabled circle colour */
	& ${Input}:disabled ~ ${ControlIndicator}:after {
		background: ${theme.colors.greyMedium};
	}
`;

const RadioButton = ({
	label,
	checked = false,
	disabled = false,
	inline = false,
	...rest
}: {
	label: string;
	name: string;
	inline?: boolean;
	checked?: boolean;
	disabled?: boolean;
} & React.HTMLAttributes<HTMLInputElement>) => (
	<ControlRadio inline={inline} checked={checked}>
		{label}
		<Input type="radio" checked={checked} disabled={disabled} {...rest} />
		<ControlIndicator />
	</ControlRadio>
);

export { RadioButton, RadioGroup };
