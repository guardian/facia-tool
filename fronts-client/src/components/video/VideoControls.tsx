import React from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import InputCheckboxToggleInline from '../inputs/InputCheckboxToggleInline';
import { Field } from 'redux-form';
import { extractAtomId, stripQueryParams } from '../../util/extractAtomId';
import { VideoUriInput } from '../inputs/VideoUriInput';
import Explainer from '../Explainer';
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

const MarginWrapper = styled.div`
	margin-bottom: 8px;
	margin-top: 8px;
`;

export const VideoControls = ({
	mainMediaVideoAtom,
	replacementVideoAtom,
	showMainVideo,
	showReplacementVideo,
	changeField,
	changeMediaField,
	replacementVideoControlsId,
}: VideoControlsProps) => {
	if (!showMainVideo && !showReplacementVideo) {
		return null;
	}

	const replacementVideoControls = document.getElementById(
		replacementVideoControlsId,
	);

	return (
		<>
			{/*
				If there is no main media atom, the replacement atom is the only one we care about.
				In this scenario we neither show the 'Use replacement video toggle', nor refer to it as a replacement.
				Note in the data model we still call this a replacement atom.
			*/}
			{replacementVideoControls !== null && mainMediaVideoAtom
				? createPortal(
						<MarginWrapper>
							<Field
								name="useReplacementVideo"
								component={InputCheckboxToggleInline}
								label="Use replacement video"
								disabled={!replacementVideoAtom}
								id={`${replacementVideoControlsId}-useReplacementVideo`}
								type="checkbox"
								dataTestId="use-replacement-video"
								checked={
									showReplacementVideo && replacementVideoAtom !== undefined
								}
								onChange={() => {
									if (showReplacementVideo) {
										changeMediaField('showMainVideo');
									} else {
										changeMediaField('videoReplace');
									}
								}}
							/>
							{!replacementVideoAtom && (
								<Explainer>Replacement video required</Explainer>
							)}
						</MarginWrapper>,
						replacementVideoControls,
					)
				: null}
			<VideoControlsOuterContainer>
				<Field
					name="replaceVideoUri"
					component={VideoUriInput}
					type="text"
					onChange={(e: any) => {
						const videoUri = e.currentTarget.value;

						if (
							videoUri !== undefined &&
							videoUri !== null &&
							videoUri !== ''
						) {
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
