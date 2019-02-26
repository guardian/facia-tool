import React from 'react';
import { CapiArticle } from 'types/Capi';
import { SearchInputState } from './SearchInput';

interface PaginationProps {
  stopPolling: () => void;
  getParams: (
    query: string,
    searchInputState: SearchInputState,
    isPreview: boolean
  ) => object;
  fetchLive: (params: object, isResource: boolean) => void;
  liveArticles: CapiArticle[];
  capiFeedIndex: number;
  inputState: SearchInputState;
}

interface PaginationState {
  displayPrevButton: boolean;
}

class Pagination extends React.Component<PaginationProps, PaginationState> {
  constructor(props: PaginationProps) {
    super(props);
  }
  public state = {
    displayPrevButton: false
  };

  private displayPrevButton = (bool: boolean) => {
    this.setState({ displayPrevButton: bool });
  };

  private prevPage(webPublicationDate: string) {
    this.props.stopPolling();
    console.log('prev');
    const { inputState } = this.props;
    const { capiFeedIndex } = this.props;
    const searchTerm = inputState.query;
    // const timestamp = moment(webPublicationDate) // TODO articles published at the same time??
    //   .add(1, 'millisecond')
    //   .format();
    const paginationParams = {
      ...this.props.getParams(searchTerm, inputState, false),
      'from-date': webPublicationDate,
      'page-size': '6'
    };
    if (capiFeedIndex === 0) {
      this.props.fetchLive(paginationParams, false);
    }
  }

  private nextPage(webPublicationDate: string) {
    this.props.stopPolling();
    console.log('next');
    const { inputState } = this.props;
    const { capiFeedIndex } = this.props;
    const searchTerm = inputState.query;
    // const timestamp = moment(webPublicationDate) // TODO articles published at the same time??
    //   .subtract(1, 'millisecond')
    //   .format();
    const paginationParams = {
      ...this.props.getParams(searchTerm, inputState, false),
      'to-date': webPublicationDate,
      'page-size': '6'
    };

    if (capiFeedIndex === 0) {
      this.props.fetchLive(paginationParams, false);
      this.displayPrevButton(true);
    }
  }

  public render() {
    const { liveArticles } = this.props;
    return (
      <div>
        {' '}
        <button
          onClick={() =>
            this.prevPage(liveArticles[0].webPublicationDate as string)
          } // TODO deal with undefined
        >
          previous
        </button>
        <button
          onClick={() =>
            this.nextPage(liveArticles[4].webPublicationDate as string)
          } // TODO deal with undefined
        >
          next
        </button>
      </div>
    );
  }
}

export default Pagination;
