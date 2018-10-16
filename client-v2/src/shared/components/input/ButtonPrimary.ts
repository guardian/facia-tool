import Button from './ButtonDefault';

export default Button.extend`
  display: inline-block;
  appearance: none;
  background: ${({ selected }) => (selected ? '#ff983f' : '#ff7f0f')};
  height: 40px;
  font-family: TS3TextSans;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  padding: 0 25px;
  border: none;
  :hover {
    background: #ff983f;
    cursor: pointer;
  }
  &:focus {
    outline: transparent;
  }
  & + & {
    margin-left: 1px;
  }
`;
