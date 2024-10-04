import React, { useState } from 'react';
import { styled } from 'constants/theme';
import ToolTip from './HoverActionToolTip';
import { CardSizes } from 'types/Collection';

const HoverActionsWrapper = styled.div<{
	size?: string; // Article Component size
}>`
	bottom: 0;
	position: relative;
	z-index: 10;
	/* Offset button margin spacing */
	margin: 0 -2px;
`;

const ToolTipWrapper = styled.div<{
	size?: string; // Article Component size
	toolTipPosition: string;
	toolTipAlign: string;
}>`
	position: absolute;
	top: ${(props) => (props.toolTipPosition === 'bottom' ? '30px' : null)};
	left: ${(props) =>
		props.toolTipPosition === 'left' || props.toolTipAlign === 'left'
			? '0px'
			: null};
	bottom: ${(props) => (props.toolTipPosition === 'top' ? '30px' : null)};
	right: ${(props) =>
		props.toolTipAlign === 'center'
			? '-10px'
			: props.toolTipPosition === 'right' || props.toolTipAlign === 'right'
				? '0px'
				: null};
`;

export interface ButtonProps {
	showToolTip: (text: string) => void;
	hideToolTip: () => void;
	size?: CardSizes;
}

interface WrapperProps {
	size?: CardSizes; // Article Component size
	toolTipPosition: 'top' | 'left' | 'bottom' | 'right';
	toolTipAlign: 'left' | 'center' | 'right';
	urlPath: string | undefined;
	renderButtons: (renderProps: ButtonProps) => JSX.Element;
}

export const HoverActionsButtonWrapper = ({
	toolTipPosition,
	toolTipAlign,
	size,
	urlPath,
	renderButtons,
}: WrapperProps) => {
	const [toolTipText, setToolTipText] = useState<string | undefined>(undefined);

	const showToolTip = (text: string) => {
		setToolTipText(text);
	};

	const hideToolTip = () => {
		setToolTipText(undefined);
	};

	return (
		<HoverActionsWrapper size={size} data-testid="hover-actions-wrapper">
			{toolTipText !== undefined ? (
				<ToolTipWrapper
					toolTipPosition={toolTipPosition}
					toolTipAlign={toolTipAlign}
				>
					<ToolTip text={toolTipText} />
				</ToolTipWrapper>
			) : null}
			{renderButtons({
				showToolTip,
				hideToolTip,
				size,
			})}
			{urlPath && (
				// the below tag is empty and meaningless to the fronts tool itself, but serves as a handle for
				// Pinboard to attach itself via, identified/distinguished by the urlPath data attribute
				// @ts-ignore
				<pinboard-article-button
					style={{ verticalAlign: 'top', marginLeft: '2px' }}
					data-url-path={urlPath}
				/>
			)}
		</HoverActionsWrapper>
	);
};
