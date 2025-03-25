import React, {useEffect} from 'react';
import styled from "styled-components";
import {Field} from "redux-form";
import InputText from "../inputs/InputText";

interface VideoControlsProps {
	atomId: string;
	active: boolean;
	onChange: (event: any) => void;
}

const fetchAssetId = async (atomId: string): Promise<string | undefined> => {
	const response = await fetch(`/api/live/atom/video/${atomId}`);
	const data = await response.json();
	if(data?.response?.status === "ok") {
		const assets = data?.response?.media?.data?.media?.assets;
		return assets && assets.length > 0 && assets[0].id || undefined;
	} else {
		return undefined;
	}
}

const VideoControlsContainer = styled.div`
	margin-top: 8px;
`

export const VideoControls = ({atomId, active, onChange}: VideoControlsProps) => {
	// TODO: Pipe through article main video

	const [assetId, setAssetId] = React.useState<string | undefined>(undefined);

	useEffect( () => {
		fetchAssetId(atomId)
			.then(assetId => setAssetId(assetId))
	}, [atomId]);

	if(!active) {
		return null;
	}

	return (
		<VideoControlsContainer>
			{assetId ? <iframe src={`https://www.youtube.com/embed/${assetId}`} allowFullScreen={true}></iframe> : null}

			<Field
				component={InputText}
				name="replaceVideoUri"
				type="text"
				onChange={onChange}
				placeholder="Paste video url"
			/>
		</VideoControlsContainer>
	);
}
