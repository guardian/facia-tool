import React from 'react';
import range from 'lodash/range';
import { IPagination as PaginationState } from 'lib/createAsyncResourceBundle';
import { styled } from 'constants/theme';
import ButtonCircularCaret from 'components/inputs/ButtonCircularCaret';

interface PaginationProps {
	pageChange: (currentPage: number) => void;
	currentPage: number;
	totalPages: number;
}

const PaginationElement = styled.span`
	padding: 0 5px;
	font-weight: bold;
	font-size: 14px;
	vertical-align: middle;
`;

const Page = styled(PaginationElement)<{ isSelected: boolean }>`
	border-radius: 100%;
	${({ isSelected, theme }) =>
		isSelected && `background-color: ${theme.colors.whiteDark};`}
	cursor: pointer;
`;

const PageContainer = styled.span`
	margin: 0 5px;
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
				<ButtonCircularCaret
					clear
					openDir="left"
					disabled={currentPage < 2}
					onClick={() => pageChange(currentPage - 1)}
				>
					previous
				</ButtonCircularCaret>
				<PageContainer>
					{addFirstPage && (
						<Page onClick={() => pageChange(1)} isSelected={currentPage === 1}>
							1
						</Page>
					)}
					{addStartingEllipsis && <PaginationElement>...</PaginationElement>}
					{pages.map((page) => (
						<Page
							key={page}
							onClick={() => pageChange(page)}
							isSelected={currentPage === page}
						>
							{page}
						</Page>
					))}
					{addEndingEllipsis && <PaginationElement>...</PaginationElement>}
				</PageContainer>
				<ButtonCircularCaret
					clear
					openDir="right"
					disabled={currentPage === lastPage}
					onClick={() => pageChange(currentPage + 1)}
				>
					next
				</ButtonCircularCaret>
			</div>
		);
	}

	private getRangeForPagination(): { min: number; max: number } {
		const { currentPage, totalPages } = this.props;
		if (currentPage < 4) {
			return {
				min: 1,
				max: Math.min(4, totalPages),
			};
		}
		if (currentPage === totalPages) {
			return {
				min: totalPages - 2,
				max: totalPages,
			};
		}
		const min = currentPage < 3 ? 1 : currentPage - 1;
		const max = currentPage === totalPages ? currentPage : currentPage + 1;
		return { min, max };
	}
}

export default Pagination;
