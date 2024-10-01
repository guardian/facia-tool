import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

export const DefaultDropContainer = styled.div<{
	doubleHeight?: boolean;
	isActive?: boolean;
}>`
	position: relative;
	height: ${({ doubleHeight }) => (doubleHeight ? '20px' : '8px')};
	z-index: 1;
`;

export const DefaultDropIndicator = styled.div<{ isActive?: boolean }>`
	position: relative;
	display: flex;
	flex-direction: row;
	height: 8px;
	opacity: 0;
	${({ isActive }) =>
		isActive &&
		`
  z-index: 1;
  opacity: 1;
  `}
`;

export const DropIndicatorBar = styled.div<{
	color?: string;
	isActive?: boolean;
}>`
	position: relative;
	height: 8px;
	width: 100%;
	margin-left: 5px;
	${({ color, isActive }) =>
		`background-color: ${
			isActive ? color : theme.colors.greyVeryLight
		} !important`}
`;

export const DropIndicatorMessage = styled.div<{
	color?: string;
	isActive?: boolean;
}>`
	position: absolute;
	padding: 0 10px;
	border-radius: 10px;
	height: 20px;
	line-height: 20px;
	top: -5px;
	font-weight: bold;
	font-family: TS3TextSans;
	font-size: 10px;
	color: white;
	${({ color, isActive }) =>
		`background-color: ${
			isActive ? color : theme.colors.greyVeryLight
		} !important`}
`;

class DropZone extends React.Component<{
	onDrop: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	disabled?: boolean;
	doubleHeight?: boolean;
	isTarget?: boolean;
	index?: number;
	length?: number;
	dropColor?: string;
	dropMessage?: string;
	dropContainer?:
		| React.ComponentType<{ index?: number; length?: number }>
		| React.ComponentType<any>;
	dropIndicator?: React.ComponentType<any>;
}> {
	public static defaultProps = {
		dropColor: theme.base.colors.dropZone,
		dropMessage: 'Place here',
	};

	public handleDrop = (e: React.DragEvent<HTMLElement>) => {
		return this.props.onDrop(e);
	};

	public render() {
		const {
			doubleHeight,
			dropColor,
			dropMessage,
			onDragOver,
			index,
			length,
			isTarget,
			dropContainer: DropContainer = DefaultDropContainer,
			dropIndicator: DropIndicator = DefaultDropIndicator,
		} = this.props;
		return (
			<DropContainer
				onDrop={this.handleDrop}
				onDragOver={onDragOver}
				index={index}
				length={length}
				doubleHeight={doubleHeight}
				data-testid="drop-zone"
				isActive={isTarget}
			>
				<DropIndicator isActive={isTarget}>
					<DropIndicatorBar isActive={isTarget} color={dropColor} />
					<DropIndicatorMessage isActive={isTarget} color={dropColor}>
						<div>{dropMessage}</div>
					</DropIndicatorMessage>
				</DropIndicator>
			</DropContainer>
		);
	}
}

export default DropZone;
