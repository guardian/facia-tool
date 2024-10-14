import React from 'react';
import { styled } from 'constants/theme';
import { sanitizeHTML } from 'util/sanitizeHTML';
import { media } from 'util/mediaQueries';
import { theme } from 'constants/theme';
import { CardSizes } from 'types/Collection';

const Wrapper = styled.span<{
	displaySize?: CardSizes;
	showLargeHeadline?: boolean;
	isToShowError?: boolean;
}>`
	font-family: TS3TextSans;
	font-weight: ${({ isToShowError }) => (isToShowError ? 'bold' : 'normal')};
	padding: 2px 0 0;
	font-size: ${theme.card.fontSizeSmall};
	${media.large`font-size: 13px;`}
`;

interface CardHeading {
	children?: string;
	html?: boolean;
	displaySize?: CardSizes;
	showLargeHeadline?: boolean;
	isToShowError?: boolean;
}

const CardHeading = ({
	children = '',
	displaySize,
	html = false,
	...props
}: CardHeading) =>
	html ? (
		<Wrapper
			dangerouslySetInnerHTML={{ __html: sanitizeHTML(children) }}
			{...props}
		/>
	) : (
		<Wrapper {...props}>{children}</Wrapper>
	);

export default CardHeading;
