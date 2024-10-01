import React from 'react';
import { styled } from 'constants/theme';

interface DropDisablerChildren {
	children: React.ReactNode;
}

const DisablerWrapper = styled.div`
	height: 100%;
`;

// This component prevents the default behaviour for drop events on this node,
// or its child nodes. When dropping links (perhaps when missing a drop
// zone), the default behaviour is navigating to the linked document
const DropDisabler = ({ children }: DropDisablerChildren) => (
	<DisablerWrapper
		onDrop={(e: React.DragEvent) => e.preventDefault()}
		onDragOver={(e: React.DragEvent) => e.preventDefault()}
	>
		{children}
	</DisablerWrapper>
);

export default DropDisabler;
