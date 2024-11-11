import React, { Fragment, ReactNode } from 'react';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import type { State } from 'types/State';
import { connect } from 'react-redux';

interface EditModeVisibilityProps {
	currentMode: EditMode;
	visibleMode: EditMode;
	children: ReactNode;
}

const EditModeVisibility = ({
	currentMode,
	visibleMode,
	children,
}: EditModeVisibilityProps) => {
	if (currentMode === visibleMode) {
		return <Fragment>{children}</Fragment>;
	} else {
		return null;
	}
};

const createMapStateToProps = (state: State) => {
	return {
		currentMode: selectEditMode(state),
	};
};

export default connect(createMapStateToProps)(EditModeVisibility);
