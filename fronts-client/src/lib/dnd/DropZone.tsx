import React from 'react';
import { Store, Sub } from './store';
import { NO_STORE_ERROR } from './constants';
import styled from 'styled-components';

interface OuterProps {
	parentKey: string;
	index: number;
	children: (isTarget: boolean, isActive: boolean) => React.ReactNode;
}

interface ContextProps {
	store: Store | null;
}

type Props = OuterProps & ContextProps;

interface State {
	isTarget: boolean;
	isActive: boolean;
}

export const DropZoneContainer = styled.div`
	/* We don't accept pointer events until our Root parent enables them */
	pointer-events: none;
	display: contents;
`;

export default class DropZone extends React.Component<Props, State> {
	public state = { isTarget: false, isActive: false };

	public componentDidMount() {
		if (!this.props.store) {
			throw new Error(NO_STORE_ERROR);
		}
		this.props.store.subscribe(this.handleStoreUpdate);
	}

	public componentWillUnmount() {
		if (!this.props.store) {
			throw new Error(NO_STORE_ERROR);
		}
		this.props.store.unsubscribe(this.handleStoreUpdate);
	}

	public render() {
		return (
			<DropZoneContainer>
				{this.props.children(this.state.isTarget, this.state.isActive)}
			</DropZoneContainer>
		);
	}

	private handleStoreUpdate: Sub = (id, hoverIndex) => {
		if (
			id === this.props.parentKey &&
			hoverIndex === this.props.index &&
			!this.state.isTarget
		) {
			this.setState({ isTarget: true });
		} else if (
			(id !== this.props.parentKey || hoverIndex !== this.props.index) &&
			this.state.isTarget
		) {
			this.setState({ isTarget: false });
		}
	};
}
