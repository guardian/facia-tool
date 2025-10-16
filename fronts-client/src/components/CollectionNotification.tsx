import React from 'react';
import { styled, theme } from 'constants/theme';

import { CollectionsWhichAreAlsoOnOtherFronts } from 'types/Collection';
import ButtonRoundedWithLabel from 'components/inputs/ButtonRoundedWithLabel';

interface CollectionNotificationProps {
	collectionsWhichAreAlsoOnOtherFronts: CollectionsWhichAreAlsoOnOtherFronts;
	displayEditWarning: boolean;
}

interface ComponentState {
	showFrontDetails: boolean;
}

const WarningText = styled.span`
	font-weight: bold;
	color: ${theme.colors.orangeDark};
`;

const ToggleDetailsButton = styled(ButtonRoundedWithLabel)`
	position: relative;
	z-index: 5;
`;

const CollectionsWhichAreAlsoOnOtherFrontsLinksWrapper = styled.div`
	position: relative;
	z-index: 5;
`;

class CollectionNotification extends React.Component<
	CollectionNotificationProps,
	ComponentState
> {
	public state = {
		showFrontDetails: false,
	};

	public render() {
		const { collectionsWhichAreAlsoOnOtherFronts, displayEditWarning } =
			this.props;
		if (displayEditWarning) {
			return (
				<div>
					<WarningText>
						Warning: do not change or delete this container. Please speak to
						Central Production.
					</WarningText>
				</div>
			);
		}

		if (collectionsWhichAreAlsoOnOtherFronts.fronts.length > 0) {
			return (
				<div>
					{collectionsWhichAreAlsoOnOtherFronts.meritsWarning && (
						<span>
							<WarningText>Warning</WarningText>
							<br />
							Also on{' '}
							{collectionsWhichAreAlsoOnOtherFronts.priorities.map(
								(priority, index) => (
									<strong key={priority}>
										{' '}
										{priority}
										{index !==
											collectionsWhichAreAlsoOnOtherFronts.priorities.length -
												1 && ','}
									</strong>
								),
							)}{' '}
							fronts.
						</span>
					)}
					{!collectionsWhichAreAlsoOnOtherFronts.meritsWarning && (
						<span>Also on other fronts.</span>
					)}
					&nbsp;
					<ToggleDetailsButton
						tabIndex={-1}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							return this.setState({
								showFrontDetails: !this.state.showFrontDetails,
							});
						}}
					>
						{this.state.showFrontDetails ? 'Hide Details' : 'Show More'}
					</ToggleDetailsButton>
					{this.state.showFrontDetails && (
						<CollectionsWhichAreAlsoOnOtherFrontsLinksWrapper>
							{collectionsWhichAreAlsoOnOtherFronts.fronts.map((front) => (
								<div key={front.id}>{front.id}</div>
							))}
						</CollectionsWhichAreAlsoOnOtherFrontsLinksWrapper>
					)}
				</div>
			);
		}
		return null;
	}
}

export default CollectionNotification;
