import React from 'react';
import SubnavForm from './SubnavForm';
import { CustomSubnav } from './types';
import { BackButton, SubnavContainer, SubnavContainerHeading } from './styles';

export interface SubnavFormViewProps {
	heading: string;
	statusBar?: React.ReactNode;
	initialSubnav?: CustomSubnav;
	onSave: (subnav: CustomSubnav) => Promise<void>;
	onCancel: () => void;
	saving: boolean;
}

export const SubnavFormView = ({
	heading,
	statusBar,
	initialSubnav,
	onSave,
	onCancel,
	saving,
}: SubnavFormViewProps) => (
	<SubnavContainer>
		<BackButton type="button" onClick={onCancel}>
			← Back to subnavs
		</BackButton>
		<SubnavContainerHeading>{heading}</SubnavContainerHeading>
		{statusBar}
		<SubnavForm initialSubnav={initialSubnav} onSave={onSave} saving={saving} />
	</SubnavContainer>
);
