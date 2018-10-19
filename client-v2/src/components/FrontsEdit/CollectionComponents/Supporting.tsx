import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/Article';
import { removeSupportingArticleFragment } from 'actions/ArticleFragments';
import { Dispatch } from 'types/Store';
import noop from 'lodash/noop';

interface ContainerProps {
  uuid: string;
  parentId: string;
  getNodeProps: any;
  isSelected?: boolean;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

class Supporting extends React.PureComponent<ContainerProps> {
  public render() {
    const { uuid, getNodeProps, onDelete, isSelected } = this.props;
    return (
      <div onClick={this.handleSelect}>
        <Article
          id={uuid}
          {...getNodeProps()}
          size="small"
          onDelete={onDelete}
          fade={!isSelected}
        />
      </div>
    );
  }
  private handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    // Supporting articles are usually contained within articles,
    // so we don't want this event to bubble up and select the
    // wrong thing.
    e.stopPropagation();
    this.props.onSelect(this.props.uuid);
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  { parentId, uuid, onDelete = noop }: ContainerProps
) => ({
  onDelete: (id: string) => {
    onDelete(id);
    dispatch(removeSupportingArticleFragment(parentId, uuid))
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Supporting);
