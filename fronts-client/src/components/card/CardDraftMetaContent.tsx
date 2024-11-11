import { styled } from 'constants/theme';
import CardMetaContent from './CardMetaContent';
import { notLiveColour } from 'util/getPillarColor';

export default styled(CardMetaContent)`
	color: ${notLiveColour};
`;
