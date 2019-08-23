import { styled } from 'constants/theme';
import { selectFocusedArticle } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import { State } from 'types/State';

const Wrapper = styled.div<{ isSelected: boolean }>`
  outline: ${props =>
    props.isSelected
      ? `1px solid ${props.theme.shared.base.colors.focusColor}`
      : `none`};
  &:focus {
    outline: 1px solid ${props => props.theme.shared.base.colors.focusColor};
  }
`;

const mapStateToProps = (
  state: State,
  { uuid, area }: { uuid: string; area: 'clipboard' | 'collection' }
) => ({
  isSelected: selectFocusedArticle(state, `${area}Article`) === uuid
});

export default connect(mapStateToProps)(Wrapper);
