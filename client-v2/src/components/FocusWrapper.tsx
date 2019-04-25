import { styled } from 'constants/theme';
import { selectFocusedArticle } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import { State } from 'types/State';

const Wrapper = styled('div')<{ isSelected: boolean }>`
  border: ${props =>
    props.isSelected
      ? `1px solid ${props.theme.shared.base.colors.focusColor}`
      : `none`};
  &:focus {
    border: 1px solid ${props => props.theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

const mapStateToProps = (state: State, { uuid }: { uuid: string }) => ({
  isSelected: selectFocusedArticle(state, 'clipboardArticle') === uuid
});

export default connect(mapStateToProps)(Wrapper);
