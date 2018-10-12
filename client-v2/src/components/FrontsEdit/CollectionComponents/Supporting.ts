

import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/Article';
import { removeSupportingArticleFragment } from 'actions/ArticleFragments';
import type { Dispatch } from 'types/Store';

type SupportingProps = {
  uuid: string,
  parentId: string,
  getNodeProps: *,
  onDelete: () => void
};

const Supporting = ({ uuid, getNodeProps, onDelete }: SupportingProps) => (
  <Article id={uuid} {...getNodeProps()} size="small" onDelete={onDelete} />
);

const mapDispatchToProps = (
  dispatch: Dispatch,
  { parentId, uuid }: SupportingProps
) => ({
  onDelete: () => dispatch(removeSupportingArticleFragment(parentId, uuid))
});

export default connect(
  null,
  mapDispatchToProps
)(Supporting);
