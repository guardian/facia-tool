import React from 'react';
import { useSelector } from 'react-redux';
import { selectHasSubnavPermission } from 'selectors/configSelectors';
import { Message, SubnavContainer, SubnavContainerHeading } from './styles';

const NoPermission = () => (
	<SubnavContainer>
		<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>
		<Message>
			You do not have permission to configure subnavs. Please contact{' '}
			<a href="mailto:central.production@guardian.co.uk">Central Production</a>{' '}
			to request access.
		</Message>
	</SubnavContainer>
);

const SubnavSection = () => {
	const hasPermission = useSelector(selectHasSubnavPermission);

	if (!hasPermission) {
		return <NoPermission />;
	}

	return (
		<SubnavContainer>
			<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>
			<Message>Subnav management coming soon.</Message>
		</SubnavContainer>
	);
};

export default SubnavSection;
