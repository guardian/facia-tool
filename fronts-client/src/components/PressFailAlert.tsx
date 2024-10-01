import React from 'react';
import { styled } from 'constants/theme';
import { error } from '../styleConstants';

interface Props {
	staleFronts: { [id: string]: boolean };
}

const AlertContainer = styled.div`
	background-color: ${error.primary};
	font-weight: normal;
	padding: 5px;
`;

const PressFailAlert = (props: Props) => {
	const failedFronts: string[] =
		props.staleFronts &&
		Object.keys(props.staleFronts).reduce((fronts, frontId) => {
			if (props.staleFronts[frontId]) {
				fronts.push(frontId);
			}
			return fronts;
		}, [] as string[]);

	const getErrorString = () => {
		const usePlural = failedFronts.length > 1;
		return `Sorry, the latest edit${usePlural ? 's' : ''} to the front${
			usePlural ? 's' : ''
		} ${failedFronts.join(',')} ${usePlural ? 'have' : 'has'} not gone live.`;
	};

	if (failedFronts && failedFronts.length > 0) {
		return <AlertContainer>{getErrorString()}</AlertContainer>;
	}
	return null;
};

export default PressFailAlert;
