import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { styled, theme } from 'constants/theme';
import SectionHeaderWithLogo from '../layout/SectionHeaderWithLogo';
import CurrentFrontsList from '../CurrentFrontsList';
import FrontsLogo from 'images/icons/fronts-logo.svg';
import Button from 'components/inputs/ButtonDefault';
import type { State } from 'types/State';
import {
	selectIsCurrentFrontsMenuOpen,
	editorShowOpenFrontsMenu,
	editorHideOpenFrontsMenu,
	createSelectEditorFrontsByPriority,
} from 'bundles/frontsUI';
import { Dispatch } from 'types/Store';
import FadeTransition from '../transitions/FadeTransition';
import { MoreIcon } from 'components/icons/Icons';
import { RouteComponentProps } from 'react-router';
import { selectEditMode } from 'selectors/pathSelectors';
import { getEditionIssue } from 'bundles/editionsIssueBundle';
import { EditMode } from 'types/EditMode';
import EditionFeedSectionHeader from './EditionFeedSectionHeader';

const FeedbackButton = styled(Button.withComponent('a'))<{
	href: string;
	target: string;
}>`
	align-self: center;
	padding-right: 10px;
	line-height: 60px;
	height: 60px;
`;

const SectionHeaderContent = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-grow: 1;
	white-space: nowrap;
	overflow: hidden;
`;

const LogoContainer = styled.div`
	background-color: ${theme.colors.greyMediumDark};
	position: relative;
	display: flex;
	vertical-align: top;
	cursor: pointer;
	z-index: 2;
	&:hover {
		background-color: ${theme.colors.greyMedium};
	}
`;

const LogoBackground = styled.div<{ includeBorder?: boolean }>`
	display: flex;
	flex-direction: row;
	width: 60px;
	height: 60px;
	border-right: 1px solid
		${({ includeBorder }) =>
			includeBorder ? theme.colors.greyMedium : 'transparent'};
`;

const Logo = styled.img`
	margin: auto;
	width: 40px;
	height: 35px;
`;

const FrontCount = styled.div`
	position: absolute;
	display: inline-block;
	font-size: 20px;
	line-height: 60px;
	width: 100%;
	top: -6px;
	text-align: center;
	color: ${theme.colors.blackDark};
`;

const CloseButtonOuter = styled.div`
	margin: auto;
	width: 40px;
	height: 40px;
	border-radius: 20px;
	border: solid 1px #ffffff;
`;

const CloseButtonInner = styled.div`
	transform: rotate(45deg);
	display: block;
	margin: 0 auto;
	width: 30px;
	height: 32px;
	top: 3px;
	position: relative;
`;

type ComponentProps = {
	toggleCurrentFrontsMenu: () => void;
	isCurrentFrontsMenuOpen: boolean;
	frontCount: number;
	getEditionsIssue: (id: string) => void;
	editMode: EditMode;
} & RouteComponentProps<{ priority: string }>;

type ContainerProps = RouteComponentProps<{ priority: string }>;

class FeedSectionHeader extends Component<ComponentProps> {
	public componentDidMount() {
		if (this.props.editMode === 'editions') {
			this.props.getEditionsIssue(this.props.match.params.priority);
		}
	}

	public render() {
		const {
			toggleCurrentFrontsMenu,
			isCurrentFrontsMenuOpen,
			frontCount,
			editMode,
		} = this.props;
		return (
			<SectionHeaderWithLogo includeBorder={!isCurrentFrontsMenuOpen}>
				<LogoContainer
					onClick={toggleCurrentFrontsMenu}
					title="Click to manage active fronts"
				>
					<LogoBackground includeBorder={isCurrentFrontsMenuOpen}>
						{!isCurrentFrontsMenuOpen ? (
							<>
								<Logo src={FrontsLogo} alt="The Fronts tool" />
								<FrontCount>{frontCount}</FrontCount>
							</>
						) : (
							<CloseButtonOuter>
								<CloseButtonInner>
									<MoreIcon size="fill" />
								</CloseButtonInner>
							</CloseButtonOuter>
						)}
					</LogoBackground>
				</LogoContainer>
				<SectionHeaderContent>
					<FadeTransition active={isCurrentFrontsMenuOpen} direction="left">
						<CurrentFrontsList />
					</FadeTransition>
					<FadeTransition active={!isCurrentFrontsMenuOpen} direction="right">
						{editMode === 'editions' ? (
							<EditionFeedSectionHeader />
						) : (
							<FeedbackButton
								href="https://docs.google.com/forms/d/e/1FAIpQLSeZje55T3OnErlTI_8iGuyZERjDy2Pybh8fdPmbnjy1PNFDAw/viewform"
								target="_blank"
							>
								Send us feedback
							</FeedbackButton>
						)}
					</FadeTransition>
				</SectionHeaderContent>
			</SectionHeaderWithLogo>
		);
	}
}

const mapStateToProps = () => {
	const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
	return (state: State) => ({
		isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state),
		frontCount: selectEditorFrontsByPriority(state).length,
		editMode: selectEditMode(state),
	});
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	getEditionsIssue: (id: string) => dispatch(getEditionIssue(id)),
	toggleCurrentFrontsMenu: (menuState: boolean) =>
		menuState
			? dispatch(editorShowOpenFrontsMenu())
			: dispatch(editorHideOpenFrontsMenu()),
});

const mergeProps = (
	stateProps: ReturnType<ReturnType<typeof mapStateToProps>>,
	dispatchProps: ReturnType<typeof mapDispatchToProps>,
	ownProps: ContainerProps,
) => ({
	...stateProps,
	...ownProps,
	...dispatchProps,
	toggleCurrentFrontsMenu: () =>
		dispatchProps.toggleCurrentFrontsMenu(!stateProps.isCurrentFrontsMenuOpen),
});

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps, mergeProps)(FeedSectionHeader),
);
