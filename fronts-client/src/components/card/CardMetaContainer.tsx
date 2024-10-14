import React from 'react';
import { styled, theme } from 'constants/theme';

import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { media } from 'util/mediaQueries';
import { CardSizes } from 'types/Collection';

const metaContainerSizeWidthMap = {
	default: 100,
	medium: 80,
	small: 60,
} as { [Sizes in CardSizes]: number };

interface MetaContainerProps {
	size?: CardSizes;
	isToShowError?: boolean;
}
const MetaContainer = styled.div<MetaContainerProps>`
	position: relative;
	flex-shrink: 0;
	/* If we have a size property, use that. */
	width: ${({ size }: MetaContainerProps) =>
		size && `${metaContainerSizeWidthMap[size]}px`};
	/* If we don't, fall back to media queries. */
	${({ size }: MetaContainerProps) =>
		!size &&
		media.large`
      width: ${metaContainerSizeWidthMap.small}px;
      word-break: break-word;
    `}
	padding: 0 4px;
	background-color: ${({ isToShowError }) =>
		isToShowError ? theme.colors.greyMediumLight : theme.colors.white};
`;

export default ({
	children,
	size = 'default',
	isToShowError,
}: {
	children?: React.ReactNode;
	size?: CardSizes;
	isToShowError?: boolean;
}) => (
	<MetaContainer
		size={size}
		isToShowError={isToShowError}
		data-testid="meta-container"
	>
		{children}
		<ShortVerticalPinline />
	</MetaContainer>
);
