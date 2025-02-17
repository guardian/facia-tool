import { styled } from 'constants/theme';
import ContainerHeading from './ContainerHeading';

export default styled(ContainerHeading)<{ setBack?: boolean }>`
	min-height: 40px;
	align-items: center;
	vertical-align: middle;
	justify-content: space-between;
	border-bottom: ${({ theme, setBack }) =>
		setBack ? 'transparent' : `1px solid ${theme.base.colors.borderColor}`};
`;
