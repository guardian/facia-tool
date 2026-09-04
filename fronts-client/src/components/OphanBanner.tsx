import React from 'react';

import styled from 'styled-components';
import { ConicalFlaskIcon } from './icons/Icons';
import { theme } from 'constants/theme';
import url from '../constants/url';

const OphanBannerContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
	background: ${({ theme }) => theme.abTest.active.background};
	color: ${({ theme }) => theme.abTest.active.text};
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	padding: 10px 18px;
	margin: 10px -14px -12px -14px;
	font-size: 14px;
`;

const FixedSizeIcon = styled.span`
	flex: none;
`;

const OphanBannerText = styled.p`
	margin: 0;
`;

const OphanBannerTitle = styled.span`
	font-weight: 600;
`;

const OphanBannerLink = styled.a`
	color: ${({ theme }) => theme.abTest.active.text};
`;

interface OphanBannerProps {
	isTestLive: boolean;
}

const OphanBanner = ({ ...props }: OphanBannerProps) => {
	return (
		<OphanBannerContainer role="status">
			<FixedSizeIcon>
				<ConicalFlaskIcon size="xs" fill={theme.abTest.active.icon} />
			</FixedSizeIcon>
			<OphanBannerText>
				<OphanBannerTitle>
					{props.isTestLive
						? 'Headline test in progress: '
						: 'Test ready to launch: '}
				</OphanBannerTitle>
				view results {!props.isTestLive && 'from other cards with this test'} in{' '}
				<OphanBannerLink
					href={url.ophan}
					target="_blank"
					rel="noreferrer noopener"
					aria-label="view results in Ophan (opens in a new tab)"
				>
					Ophan
				</OphanBannerLink>
			</OphanBannerText>
		</OphanBannerContainer>
	);
};

export { OphanBanner };
