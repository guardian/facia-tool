import React from 'react';
import { Group as TGroup } from 'shared/types/Collection';
import { groupSelector, selectSharedState } from 'shared/selectors/shared';
import { State } from 'types/State';
import { connect } from 'react-redux';

type GroupProps = {
  id: string;
  children: (group: TGroup) => React.ReactNode;
};

type GroupContainerProps = {
  group: TGroup;
};

const Group = ({ children, group }: GroupProps & GroupContainerProps) => (
  <>{children(group)}</>
);

const mapStateToProps = (state: State, { id }: GroupProps) => ({
  group: groupSelector(selectSharedState(state), { groupId: id })
});

export default connect(mapStateToProps)(Group);
