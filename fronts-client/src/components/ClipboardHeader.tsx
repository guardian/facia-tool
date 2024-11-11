import React from 'react';
import { Dispatch } from 'types/Store';
import { connect } from 'react-redux';
import {
	selectIsClipboardOpen,
	editorOpenClipboard,
	editorCloseClipboard,
} from 'bundles/frontsUI';
import type { State } from 'types/State';
import { styled, theme } from 'constants/theme';
import ButtonCircularCaret from 'components/inputs/ButtonCircularCaret';
import DragIntentContainer from 'components/DragIntentContainer';

interface ClipboardHeaderProps {
	isClipboardOpen: boolean;
	toggleClipboard: (open: boolean) => void;
}

const StyledDragIntentContainer = styled(DragIntentContainer)`
	display: flex;
	flex-direction: column;
	min-height: 100%;
`;

const Header = styled.div<{
	isOpen: boolean;
}>`
	background-color: ${theme.collection.background};
	align-items: center;
	justify-content: space-between;
	border-right: none;
	border: ${`1px solid ${theme.base.colors.borderColor}`};
	border-right: none;
	display: flex;
	padding: 10px;
	height: 52px;
	margin-left: 8px;
	box-shadow: ${({ isOpen }) =>
		`2px 0 0 -1px ${isOpen ? theme.collection.background : 'none'}`};
`;

const ClipboardTitle = styled.label`
	font-size: 12px;
	font-weight: bold;
	line-height: 1;
	margin: 0;
	padding: 5px;
	cursor: pointer;
`;

class ClipboardHeader extends React.Component<ClipboardHeaderProps> {
	public state = {
		preActive: false,
	};
	public render() {
		return (
			<StyledDragIntentContainer
				active={!this.props.isClipboardOpen}
				delay={300}
				onDragIntentStart={() => this.setState({ preActive: true })}
				onDragIntentEnd={() => this.setState({ preActive: false })}
				onIntentConfirm={() => this.props.toggleClipboard(true)}
			>
				<Header isOpen={this.props.isClipboardOpen}>
					<ClipboardTitle htmlFor="btn-clipboard-toggle">
						Clipboard
					</ClipboardTitle>
					<ButtonCircularCaret
						id="btn-clipboard-toggle"
						openDir="right"
						active={this.props.isClipboardOpen}
						preActive={this.state.preActive}
						onClick={() =>
							this.props.toggleClipboard(!this.props.isClipboardOpen)
						}
						small={true}
					/>
				</Header>
			</StyledDragIntentContainer>
		);
	}
}

const mapStateToProps = (state: State) => ({
	isClipboardOpen: selectIsClipboardOpen(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	toggleClipboard: (open: boolean) =>
		dispatch(open ? editorOpenClipboard() : editorCloseClipboard()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ClipboardHeader);
