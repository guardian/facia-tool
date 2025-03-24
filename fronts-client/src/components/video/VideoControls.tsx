import React, {useEffect} from 'react';

interface VideoControlsProps {
	atomId: string;
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


export const VideoControls = ({atomId}: VideoControlsProps) => {
	// TODO: Pipe through article main video

	const [assetId, setAssetId] = React.useState<string | undefined>(undefined);

	useEffect( () => {
		fetchAssetId(atomId)
			.then(assetId => setAssetId(assetId))
	}, [atomId]);

	return (
		<>
			{assetId ? <iframe src={`https://www.youtube.com/embed/${assetId}`} allowFullScreen={true}></iframe> : null}
		</>
	);
}
