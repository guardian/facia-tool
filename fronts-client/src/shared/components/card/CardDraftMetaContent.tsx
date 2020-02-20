import { styled } from 'constants/theme-shared';
import CardMetaContent from './CardMetaContent';
import { notLiveColour } from 'shared/util/getPillarColor';

export default styled(CardMetaContent)`
  color: ${notLiveColour};
`;
