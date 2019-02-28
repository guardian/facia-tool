import React from 'react';
import { IPagination as PaginationState } from 'lib/createAsyncResourceBundle';

interface PaginationProps {
  pageChange: (currentPage: number) => void;
  currentPage: number;
  totalPages: number;
}

class Pagination extends React.Component<PaginationProps, PaginationState> {
  constructor(props: PaginationProps) {
    super(props);
  }

  public render() {
    const { pageChange, currentPage, totalPages } = this.props;
    return (
      <div>
        <button
          disabled={currentPage < 2}
          onClick={() => pageChange(currentPage - 1)}
        >
          previous
        </button>
        <span>
          {currentPage} of {totalPages > 50 ? '50+' : totalPages}
        </span>
        <button onClick={() => pageChange(currentPage + 1)}>next</button>
      </div>
    );
  }
}

export default Pagination;
