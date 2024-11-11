import React from 'react';
import CircularIconContainer from './CircularIconContainer';
import { styled, theme } from 'constants/theme';

interface Props {
	widthAspectRatio: number;
	heightAspectRatio: number;
}

const AspectText = styled.span`
	font-family: TS3TextSans;
	font-size: 11px;
	line-height: 1;
	display: inline-block;
	min-width: 20px;
	text-align: center;
	color: ${theme.colors.white};
`;

const Container = styled(CircularIconContainer)`
	margin-right: 10px;
	background-color: ${theme.colors.blackLight};
`;

const getAspectDescription = (
	widthAspectRatio: number,
	heightAspectRatio: number,
): string =>
	widthAspectRatio > heightAspectRatio
		? 'landscape'
		: widthAspectRatio < heightAspectRatio
			? 'portrait'
			: 'square';

export const AspectRatioBadge: React.FunctionComponent<Props> = ({
	widthAspectRatio,
	heightAspectRatio,
}) => {
	return (
		<Container
			title={`uses ${widthAspectRatio}:${heightAspectRatio} (${getAspectDescription(
				widthAspectRatio,
				heightAspectRatio,
			)}) image crops`}
		>
			<AspectText>
				{widthAspectRatio}:{heightAspectRatio}
			</AspectText>
		</Container>
	);
};
