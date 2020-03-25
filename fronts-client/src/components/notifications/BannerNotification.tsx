import React from 'react';
import { styled, theme } from 'constants/theme';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { bindActionCreators } from 'redux';

import {
  selectBannerMessage,
  actionRemoveNotificationBanner
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
  color: white;
`;

const Message = styled.div`
  flex-grow: 1;
`;

const CloseButton = styled(Button).attrs({ size: 'm', priority: 'transparent' })`
  margin-left: auto;
  padding: 0;
  width: 26px;
`;

const NotificationsBanner = ({
  message,
  actionRemoveNotificationBanner: removeNotificationBanner
}: Props) => (
  <BannerWrapper>
    <Message>{message}</Message>
    <CloseButton onClick={removeNotificationBanner}>
      <ClearIcon size="fill" />
    </CloseButton>
  </BannerWrapper>
);

const mapStateToProps = (state: State) => ({
  message: selectBannerMessage(state)
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ actionRemoveNotificationBanner }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationsBanner);
