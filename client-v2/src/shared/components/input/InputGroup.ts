import styled from 'styled-components';
import InputContainer from './InputContainer';

export default styled('div')`
  & > ${InputContainer} {
    margin: 6px 0;
  }
  padding-bottom: 4px;
`;
