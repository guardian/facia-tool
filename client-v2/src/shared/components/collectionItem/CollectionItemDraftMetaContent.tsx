import { styled } from 'shared/constants/theme';
import CollectionItemMetaContent from './CollectionItemMetaContent';
import { notLiveColour } from 'shared/util/getPillarColor';

export default styled(CollectionItemMetaContent)`
  color: ${notLiveColour};
`;
