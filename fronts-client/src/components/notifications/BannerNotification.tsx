import React from 'react';
import { styled, theme } from 'constants/theme';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import { bindActionCreators } from 'redux';

import {
	selectBanners,
	actionRemoveNotificationBanner,
} from 'bundles/notificationsBundle';
import { Dispatch } from 'types/Store';
import { ClearIcon } from 'components/icons/Icons';
import Button from 'components/inputs/ButtonDefault';

type Props = ReturnType<typeof mapStateToProps> &
	ReturnType<typeof mapDispatchToProps>;

const BannerWrapper = styled.div`
	background-color: ${theme.base.colors.dangerColor};
	display: flex;
	position: relative;
	padding: 10px;
	text-align: center;
	color: ${theme.base.colors.textLight};
	& + & {
		border-top: 1px solid ${theme.colors.blackTransparent20};
	}
`;

const Message = styled.div`
	flex-grow: 1;
	a,
	a:hover {
		color: ${theme.base.colors.textLight};
	}
`;

const CloseButton = styled(Button).attrs({
	size: 'm',
	priority: 'transparent',
})`
	margin-left: auto;
	padding: 0;
	width: 26px;
	flex-shrink: 0;
`;

const NotificationsBanner = ({
	banners,
	actionRemoveNotificationBanner: removeNotificationBanner,
}: Props) => (
	<>
		{banners.map((banner) => (
			<BannerWrapper key={banner.id}>
				<Message>
					<span dangerouslySetInnerHTML={{ __html: banner.message }} />
					{banner.duplicates ? ` (${banner.duplicates + 1})` : ''}
				</Message>
				<CloseButton
					onClick={() => {
						banner.dismissalCallback?.();
						removeNotificationBanner(banner.id);
					}}
				>
					<ClearIcon size="fill" />
				</CloseButton>
			</BannerWrapper>
		))}
	</>
);

const mapStateToProps = (state: State) => ({
	banners: selectBanners(state),
});

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators({ actionRemoveNotificationBanner }, dispatch);

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(NotificationsBanner);
