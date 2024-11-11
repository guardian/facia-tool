import React from 'react';
import HomeContainer from 'components/layout/HomeContainer';
import FeaturesForm from './FeaturesForm';
import { styled } from 'constants/theme';

const FeaturesFormContainer = styled.div`
	width: 400px;
`;

const featuresView = () => (
	<HomeContainer>
		<h1>Feature switches</h1>
		<FeaturesFormContainer>
			<FeaturesForm />
		</FeaturesFormContainer>
	</HomeContainer>
);

export default featuresView;
