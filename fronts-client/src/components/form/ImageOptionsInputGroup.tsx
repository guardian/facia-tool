import { styled } from 'constants/theme';

export const ImageOptionsInputGroup = styled.div`
	display: flex;
	height: fit-content;
	flex-wrap: wrap;
	flex: 1;
	flex-direction: column;
	margin-top: ${(props: { size?: string }) =>
		props.size !== 'wide' ? 0 : '6px'};
`;
