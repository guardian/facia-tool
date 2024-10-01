import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { StyledProps } from 'styled-components';
import clamp from 'lodash/clamp';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { RewindIcon } from '../icons/Icons';
import { styled } from 'constants/theme';

type Props = {
	label?: string;
	// If provided, the user can revert to this value by clicking the 'rewind' button.
	originalValue?: string;
	component: React.Component<
		React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
	>;
	labelContent?: React.Component<{}>;
	type?: string;
} & WrappedFieldProps;

interface State {
	inputHeight: number | string;
}

const RewindButton = styled.button.attrs({
	type: 'button',
})`
	background: transparent;
	align-self: center;
	border: none;
	opacity: 0.5;
	cursor: pointer;
	&:hover {
		opacity: 1;
	}
	&:active,
	&:focus {
		outline: none;
	}
`;

export const TextInputLabel = styled(InputLabel)`
	display: ${(props) => (props.hidden ? 'none' : 'flex')};
	align-items: flex-end;
`;

const InputComponentContainer = styled.div`
	position: relative;
	&:hover {
		${RewindButton} {
			display: block;
		}
	}
`;

const createResizeableTextInput = (
	Component: React.ComponentType<any>,
	type?: string,
	maxAutoResizeHeight: number = 120,
) => {
	return class ResizeableTextInput extends React.Component<Props, State> {
		private inputElement: React.RefObject<HTMLInputElement>;
		constructor(props: Props) {
			super(props);
			this.inputElement = React.createRef();
			this.state = { inputHeight: 'auto' };
		}

		public componentDidMount() {
			this.updateHeight();
		}

		public componentDidUpdate(prevProps: Props) {
			if (prevProps.input.value !== this.props.input.value) {
				this.updateHeight();
			}
		}

		public updateHeight() {
			if (
				this.inputElement.current &&
				this.inputElement.current.type === 'textarea'
			) {
				this.setState({
					inputHeight: clamp(
						this.inputElement.current.scrollHeight,
						0,
						maxAutoResizeHeight,
					),
				});
			}
		}

		public render() {
			const {
				label,
				input,
				originalValue,
				labelContent: LabelContent,
				...rest
			} = this.props;
			return (
				<InputContainer>
					{label && (
						<TextInputLabel htmlFor={label}>
							<span>{label}</span>
							{originalValue && input.value !== originalValue && (
								<RewindButton onClick={() => input.onChange(originalValue)}>
									<RewindIcon />
								</RewindButton>
							)}
							{LabelContent}
						</TextInputLabel>
					)}
					<InputComponentContainer>
						<Component
							ref={this.inputElement}
							style={{ height: this.state.inputHeight }}
							id={label}
							{...input}
							{...rest}
							type={type}
						/>
					</InputComponentContainer>
				</InputContainer>
			);
		}
	};
};

export { createResizeableTextInput };
