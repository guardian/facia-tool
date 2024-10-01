import React from 'react';
import { styled, theme } from 'constants/theme';
import FadeIn from 'components/animation/FadeIn';
import {
	MoreIcon,
	MagnifyingGlassIcon as SearchIcon,
} from 'components/icons/Icons';

import LargeSectionHeader from '../layout/LargeSectionHeader';
import ButtonOverlay from '../inputs/ButtonOverlay';
import ScrollContainer from '../ScrollContainer';
import Overlay from '../layout/Overlay';
import FrontsList from '../FrontsListContainer';
import Row from 'components/Row';
import Col from 'components/Col';

const FrontsMenuContent = styled.div`
	flex: 1;
	padding: 0 20px;
`;

const FrontsMenuHeading = styled(LargeSectionHeader)`
	padding: 10px;
	margin: 0 10px 10px;
	border-bottom: solid 1px ${theme.front.frontListBorder};
`;

const FrontsMenuSubHeading = styled.div`
	position: relative;
	padding: 10px 0;
	font-size: 16px;
	line-height: 30px;
	font-weight: bold;
	color: ${theme.colors.orangeLight};
	border-bottom: solid 1px ${theme.front.frontListBorder};
	max-height: 100%;
`;

const ButtonOverlayContainer = styled.div`
	position: absolute;
	left: -80px;
	bottom: 30px;
`;

const FrontsMenuContainer = styled.div<{ isOpen?: boolean }>`
	z-index: 100;
	background-color: ${theme.colors.blackLight};
	position: fixed;
	height: 100%;
	width: 390px;
	top: 0;
	right: 0;
	color: ${theme.base.colors.textLight};
	transition: transform 0.15s;
	transform: ${({ isOpen }) =>
		isOpen ? 'translate3d(0px, 0, 0)' : 'translate3d(390px, 0, 0)'};
`;

const FrontsMenuSearchInputContainer = styled(Col)`
	position: relative;
`;

const FrontsMenuSearchInput = styled.input`
	background-color: rgba(0, 0, 0, 0.2);
	height: 30px;
	width: 100%;
	padding: 5px;
	padding-right: 20px;
	border: 0;
	color: white;
	font-family: TS3TextSans;
	font-size: 16px;
	:active,
	:focus {
		outline: none;
	}
`;

const FrontsMenuSearchImage = styled.div`
	position: absolute;
	right: 5px;
	top: 0;
`;

interface Props {
	onSelectFront: (frontId: string) => void;
	onFavouriteFront: (frontId: string) => void;
	onUnfavouriteFront: (frontId: string) => void;
}

interface State {
	isOpen: boolean;
	searchString: string;
}

class FrontsMenu extends React.Component<Props, State> {
	public state = {
		isOpen: false,
		searchString: '',
	};
	public inputRef = React.createRef<HTMLInputElement>();

	public onSelectFront = (frontId: string) => {
		this.toggleFrontsMenu();
		this.props.onSelectFront(frontId);
	};

	public onFavouriteFront = (frontId: string) => {
		this.props.onFavouriteFront(frontId);
	};

	public onUnfavouriteFront = (frontId: string) => {
		this.props.onUnfavouriteFront(frontId);
	};

	public onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target || !(event.target instanceof HTMLInputElement)) {
			return;
		}
		this.setState({
			searchString: event.target.value,
		});
	};

	public toggleFrontsMenu = () => {
		if (!this.state.isOpen && this.inputRef.current) {
			this.inputRef.current.focus();
		}
		this.setState({
			isOpen: !this.state.isOpen,
		});
	};

	public render() {
		return (
			<>
				{this.state.isOpen && (
					<FadeIn>
						<Overlay />
					</FadeIn>
				)}
				<FrontsMenuContainer isOpen={this.state.isOpen}>
					<ButtonOverlayContainer>
						<ButtonOverlay
							data-testid="fronts-menu-button"
							onClick={this.toggleFrontsMenu}
							active={this.state.isOpen}
						>
							<MoreIcon size={'xxl'} />
						</ButtonOverlay>
					</ButtonOverlayContainer>
					<ScrollContainer
						fixed={<FrontsMenuHeading>Add Front</FrontsMenuHeading>}
					>
						<FrontsMenuContent>
							<FrontsMenuSubHeading>
								<Row>
									<Col>Favourites</Col>
								</Row>
							</FrontsMenuSubHeading>
							<FrontsList
								renderOnlyStarred
								onSelect={this.onSelectFront}
								onStar={this.onFavouriteFront}
								onUnfavourite={this.onUnfavouriteFront}
							/>

							<FrontsMenuSubHeading>
								<Row>
									<Col>All</Col>
									<FrontsMenuSearchInputContainer>
										<FrontsMenuSearchInput
											value={this.state.searchString}
											onChange={this.onInput}
											ref={this.inputRef}
										/>
										<FrontsMenuSearchImage>
											<SearchIcon size={'xl'} title={'Search fronts'} />
										</FrontsMenuSearchImage>
									</FrontsMenuSearchInputContainer>
								</Row>
							</FrontsMenuSubHeading>
							<FrontsList
								onSelect={this.onSelectFront}
								onStar={this.onFavouriteFront}
								onUnfavourite={this.onUnfavouriteFront}
								searchString={this.state.searchString}
							/>
						</FrontsMenuContent>
					</ScrollContainer>
				</FrontsMenuContainer>
			</>
		);
	}
}

export default FrontsMenu;
