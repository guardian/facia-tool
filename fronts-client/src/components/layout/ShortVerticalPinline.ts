// @flow

import { styled } from 'constants/theme';

export default styled.div`
	position: absolute;
	top: 0;
	right: 0;
	height: 20px;
	border-right: ${({ theme }) => `1px solid ${theme.base?.colors.borderColor}`};
`;
