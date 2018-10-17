import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/Article';
import { removeSupportingArticleFragment } from 'actions/ArticleFragments';
import { Dispatch } from 'types/Store';

interface ContainerProps {
  uuid: string;
  parentId: string;
  getNodeProps: any;
}

type SupportingProps = ContainerProps & {
  onDelete: () => void;
};

const Supporting = ({ uuid, getNodeProps, onDelete }: SupportingProps) => (
  <Article id={uuid} {...getNodeProps()} size="small" onDelete={onDelete} />
);

const mapDispatchToProps = (
  dispatch: Dispatch,
  { parentId, uuid }: ContainerProps
) => ({
  onDelete: () => dispatch(removeSupportingArticleFragment(parentId, uuid))
});

export default connect(
  null,
  mapDispatchToProps
)(Supporting);
