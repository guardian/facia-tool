import ContainerHeading from './ContainerHeading';

export default ContainerHeading.extend`
  border-bottom: ${({ theme }) => `1px solid ${theme.base.colors.borderColor}`};
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  justify-content: space-between;
`;
