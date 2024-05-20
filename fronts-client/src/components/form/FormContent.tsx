import { styled } from 'constants/theme';

export type FormSize = 'wide' | 'default';

export const FormContent = styled.div`
  flex: 3;
  display: flex;
  flex-direction: ${(props: { size?: FormSize }) =>
    props.size !== 'wide' ? 'column' : 'row'};
  margin-bottom: 40px;
`;
