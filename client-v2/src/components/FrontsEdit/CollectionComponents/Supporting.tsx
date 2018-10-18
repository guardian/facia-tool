import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/Article';
import { removeSupportingArticleFragment } from 'actions/ArticleFragments';
import { Dispatch } from 'types/Store';

interface ContainerProps {
  uuid: string;
  parentId: string;
  getNodeProps: any;
  onSelect: (uuid: string) => void;
}

type SupportingProps = ContainerProps & {
  onDelete: () => void;
};

class Supporting extends React.PureComponent<SupportingProps> {
  public render() {
    const { uuid, getNodeProps, onDelete } = this.props;
    return (
      <div onClick={this.handleSelect}>
        <Article
          id={uuid}
          {...getNodeProps()}
          size="small"
          onDelete={onDelete}
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
  { parentId, uuid }: ContainerProps
) => ({
  onDelete: () => dispatch(removeSupportingArticleFragment(parentId, uuid))
});

export default connect(
  null,
  mapDispatchToProps
)(Supporting);
