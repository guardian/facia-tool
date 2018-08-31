// @flow

import LargeSectionHeader from './LargeSectionHeader';

const SectionHeader = LargeSectionHeader.extend`
  background-color: #333;
  border-right: solid 1px #dcdcdc;
`;

const SectionHeaderUnpadded = SectionHeader.extend`
  padding: 0;
`;

export { SectionHeaderUnpadded };

export default SectionHeader;
