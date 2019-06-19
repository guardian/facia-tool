import React from 'react';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import { connect } from 'react-redux';
import { CollectionItemSets } from 'shared/types/Collection';
import { selectIsFrontOverviewOpen } from 'bundles/frontsUIBundle';
import { State } from 'types/State';

interface ContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

interface ComponentProps extends ContainerProps {
  overviewIsOpen: boolean;
}

const FrontsDetailView = ({
  id,
  browsingStage,
  overviewIsOpen
}: ComponentProps) => {
  if (overviewIsOpen) {
    return <FrontCollectionsOverview id={id} browsingStage={browsingStage} />;
  }
  return null;
};

const mapStateToProps = (state: State, props: ContainerProps) => ({
  overviewIsOpen: selectIsFrontOverviewOpen(state, props.id)
});

export default connect(mapStateToProps)(FrontsDetailView);
