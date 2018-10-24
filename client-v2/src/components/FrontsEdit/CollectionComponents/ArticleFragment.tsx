import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/Article';
import { Dispatch } from 'types/Store';
import { removeGroupArticleFragment } from 'actions/ArticleFragments';
import { ArticleFragmentDenormalised } from 'shared/types/Collection';

interface ContainerProps {
  isSelected?: boolean;
  uuid: string;
  children: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  parentId: string;
}

type ArticleFragmentProps = ContainerProps & {
  onDelete: () => void;
};

const ArticleFragment = ({
  uuid,
  isSelected,
  children,
  getNodeProps,
  onSelect,
  onDelete
}: ArticleFragmentProps) => (
  <Article
    id={uuid}
    {...getNodeProps()}
    onDelete={onDelete}
    onClick={() => onSelect(uuid)}
    fade={!isSelected}
  >
    {children}
  </Article>
);

const mapDispatchToProps = (
  dispatch: Dispatch,
  { parentId, uuid, onDelete }: ContainerProps
) => ({
  onDelete: () => {
    onDelete(uuid);
    dispatch(removeGroupArticleFragment(parentId, uuid));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(ArticleFragment);
