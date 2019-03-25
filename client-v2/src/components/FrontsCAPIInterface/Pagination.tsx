import React from 'react';
import range from 'lodash/range';
import { IPagination as PaginationState } from 'lib/createAsyncResourceBundle';
import { styled } from 'constants/theme';

interface PaginationProps {
  pageChange: (currentPage: number) => void;
  currentPage: number;
  totalPages: number;
}

const Page = styled.span<{ isSelected: boolean }>`
  padding: 2px 5px;
  border-radius: 100%;
  ${({ isSelected, theme }) =>
    isSelected &&
    `background-color: ${theme.shared.base.colors.backgroundColorFocused}`}
  cursor: pointer;
`;

class Pagination extends React.Component<PaginationProps, PaginationState> {
  constructor(props: PaginationProps) {
    super(props);
  }

  public render() {
    const { currentPage, pageChange, totalPages } = this.props;
    const { min, max } = this.getRangeForPagination();
    const pages = range(min, max + 1);
    const lastPage = pages[pages.length - 1];
    const addStartingEllipsis = pages[0] > 2;
    const addEndingEllipsis = lastPage !== totalPages;
    const addFirstPage = pages[0] !== 1;

    return (
      <div>
        <button
          disabled={currentPage < 2}
          onClick={() => pageChange(currentPage - 1)}
        >
          previous
        </button>
        {addFirstPage && (
          <Page onClick={() => pageChange(1)} isSelected={currentPage === 1}>
            1
          </Page>
        )}
        {addStartingEllipsis && <span>...</span>}
        {pages.map(page => (
          <Page
            onClick={() => pageChange(page)}
            isSelected={currentPage === page}
          >
            {page}
          </Page>
        ))}
        {addEndingEllipsis && <span>...</span>}
        <button
          disabled={currentPage === lastPage}
          onClick={() => pageChange(currentPage + 1)}
        >
          next
        </button>
      </div>
    );
  }

  private getRangeForPagination(): { min: number; max: number } {
    const { currentPage, totalPages } = this.props;
    if (currentPage < 4) {
      return {
        min: 1,
        max: Math.min(4, totalPages)
      };
    }
    if (currentPage === totalPages) {
      return {
        min: totalPages - 2,
        max: totalPages
      };
    }
    const min = currentPage < 3 ? 1 : currentPage - 1;
    const max = currentPage === totalPages ? currentPage : currentPage + 1;
    return { min, max };
  }
}

export default Pagination;
