import ContainerHeading from './ContainerHeading';

export default ContainerHeading.extend`
  align-items: center;
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  justify-content: space-between;
`;
