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

const OphanBannerTitle = styled.span`
	font-weight: 600;
`;

const OphanBannerLink = styled.a`
	color: ${({ theme }) => theme.abTest.active.text};
`;

const OphanBanner = () => {
	return (
		<OphanBannerContainer role="status">
			<ConicalFlaskIcon size="xs" fill={theme.abTest.active.icon} />
			<OphanBannerTitle>Headline Test In Progress :</OphanBannerTitle>
			<span>
				View results in{' '}
				<OphanBannerLink
					href={url.ophan}
					target="_blank"
					rel="noreferrer noopener"
					aria-label="View results in Ophan (opens in a new tab)"
				>
					Ophan
				</OphanBannerLink>
			</span>
		</OphanBannerContainer>
	);
};

export { OphanBanner };
