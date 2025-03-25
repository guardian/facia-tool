import React, {useEffect} from 'react';
import styled from "styled-components";
import {Field} from "redux-form";
import InputText from "../inputs/InputText";

interface VideoControlsProps {
	atomId: string;
	active: boolean;
	onChange: (event: any) => void;
}

const fetchAtom = async (atomId: string): Promise<any> => {
	const response = await fetch(`/api/live/atom/video/${atomId}`);
	const data = await response.json();
	if(data?.response?.status !== "ok") {
		throw new Error(`Failed to fetch atom ${atomId}`);
	} else {
		return data?.response;
	}
}

const extractAssetId = (atom: any): string | undefined => {
	const assets = atom?.media?.data?.media?.assets;
	if(assets === undefined || assets.length === 0 || assets[0] === undefined || assets[0].id === undefined) {
		throw new Error(`No assets found for atom ${atom.id}`);
	} else {
		return assets[0].id;
	}
}

const extractVideoTrailImage = (atom: any): string | undefined => {
	const imageAssets = atom?.media?.data?.media?.trailImage?.assets;

	if(imageAssets === undefined || imageAssets.length === 0 || imageAssets[0] === undefined || imageAssets[0].file === undefined) {
		throw new Error(`No trail image found for atom ${atom.id}`);
	} else {
		return imageAssets[0].file;
	}
}

const VideoControlsContainer = styled.div`
	margin-top: 8px;
`

const VideoTrailImage = styled.img`
	width: 100%;
`

export const VideoControls = ({atomId, active, onChange}: VideoControlsProps) => {
	// TODO: Pipe through article main video

	const [_assetId, setAssetId] = React.useState<string | undefined>(undefined);
	const [trailImageUri, setTrailImageUri] = React.useState<string | undefined>(undefined);

	useEffect( () => {
		// TODO: Fetch on debounce?
		fetchAtom(atomId)
			.then((atom) => {
				const assetId = extractAssetId(atom);
				if(assetId !== undefined) {
					setAssetId(assetId);
				}

				const trailImage = extractVideoTrailImage(atom);
				if(trailImage !== undefined) {
					setTrailImageUri(trailImage);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, [atomId]);

	if(!active) {
		return null;
	}

	return (
		<VideoControlsContainer>
			{trailImageUri ? <VideoTrailImage src={trailImageUri} alt="Video thumbnail" /> : null}
			{/*{assetId ? <iframe src={`https://www.youtube.com/embed/${assetId}`} allowFullScreen={true}></iframe> : null}*/}
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
