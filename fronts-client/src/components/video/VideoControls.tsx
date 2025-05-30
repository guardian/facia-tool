import React from 'react';
import styled from 'styled-components';
import { Field } from 'redux-form';
import { extractAtomId, stripQueryParams } from '../../util/extractAtomId';
import { VideoUriInput } from '../inputs/VideoUriInput';
import type { Atom } from '../../types/Capi';

interface VideoControlsProps {
	videoBaseUrl: string | null;
	mainMediaVideoAtom: Atom | undefined;
	replacementVideoAtom: Atom | undefined;
	showMainVideo: boolean;
	showReplacementVideo: boolean;
	changeField: (field: string, value: any) => void;
	changeMediaField: (fieldToSet: string) => void;
	form: any;
	replacementVideoControlsId: string;
	warningsContainerId: string;
}

const VideoControlsOuterContainer = styled.div`
	margin-top: 8px;
	position: relative;
`;

export const VideoControls = ({
	videoBaseUrl,
	mainMediaVideoAtom,
	replacementVideoAtom,
	showMainVideo,
	showReplacementVideo,
	changeField,
	changeMediaField,
	form,
	replacementVideoControlsId,
	warningsContainerId,
}: VideoControlsProps) => {
	if (!showMainVideo && !showReplacementVideo) {
		return null;
	}

	return (
		<>
			<VideoControlsOuterContainer>
				<Field
					name="replaceVideoUri"
					component={VideoUriInput}
					type="text"
					onChange={(e: any) => {
						const videoUri = e.currentTarget.value;

						if (videoUri) {
							changeMediaField('videoReplace');
						} else {
							changeMediaField('showMainVideo');
						}

						changeField('atomId', extractAtomId(videoUri));
					}}
					placeholder="Paste video url"
					normalize={stripQueryParams}
				></Field>
			</VideoControlsOuterContainer>
		</>
	);
};
