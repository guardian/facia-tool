import { styled } from 'shared/constants/theme';
import CardMetaContent from './CardMetaContent';
import { notLiveColour } from 'shared/util/getPillarColor';

export default styled(CardMetaContent)`
  color: ${notLiveColour};
`;
