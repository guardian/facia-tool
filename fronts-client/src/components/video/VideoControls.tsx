import React, {useEffect} from 'react';
import styled from "styled-components";
import ButtonDefault from "../inputs/ButtonDefault";
import InputBase from "../inputs/InputBase";

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

const VideoControlsOuterContainer = styled.div`
	margin-top: 8px;
	position: relative;
`

const VideoAction = styled(ButtonDefault)<{ small?: boolean }>`
	background-color: #5e5e5e50;
	&:hover,
	&:active,
	&:hover:enabled,
	&:active:enabled {
      background-color: #5e5e5e99;
    }
	height: 50%;
	width: 100%;
	font-size: 12px;
	flex-grow: 1;
	padding: 0;
	text-shadow: 0 0 2px black;
	display: inline-block;
`;

const VideoControlsInnerContainer = styled.div<{url?: string}>`
	background-image: url(${props => props.url});
	height: 100%;
	position: relative;
	aspect-ratio: 5 / 4;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	-webkit-box-flex: 1;
	flex-grow: 1;
	margin-bottom: 5px;
	//cursor: grab;
`;

const VideoUrlInput = styled(InputBase)`
	border: none;
	:focus,
	:active {
		border: none;
	}
	::placeholder {
		font-size: 12px;
	}
`;

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
		<VideoControlsOuterContainer>
			<VideoControlsInnerContainer url={trailImageUri}>
				<VideoAction
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						console.log('replace video');
					}}
				>
					Replace video
				</VideoAction>
				<VideoAction
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						console.log('preview video');
					}}
				>
					Preview video
				</VideoAction>
			</VideoControlsInnerContainer>
			{/*{assetId ? <iframe src={`https://www.youtube.com/embed/${assetId}`} allowFullScreen={true}></iframe> : null}*/}
			<VideoUrlInput
				name="replaceVideoUri"
				type="text"
				onChange={onChange}
				placeholder="Paste video url"
			/>
		</VideoControlsOuterContainer>
	);
}
