import { styled } from 'constants/theme';
import ContainerHeading from './ContainerHeading';

export default styled(ContainerHeading)<{ setBack?: boolean }>`
	align-items: center;
	height: 40px;
	line-height: 40px;
	vertical-align: middle;
	justify-content: space-between;
	border-bottom: ${({ theme, setBack }) =>
		setBack ? 'transparent' : `1px solid ${theme.base.colors.borderColor}`};
`;
