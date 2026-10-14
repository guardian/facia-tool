import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { semanticSpacing } from '@guardian/stand';
import { styled } from '../../constants/theme';
import React from 'react';

const InlineWrap = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: ${semanticSpacing.stackXs};
`;

const Stack = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackSm};
`;

export function AppLinkControls({
	deepLink,
	title,
	isPublished,
	isDisabled,
}: {
	deepLink: string;
	title: string;
	isPublished: boolean;
	isDisabled: boolean;
}) {
	const [copyStatus, setCopyStatus] = useState<
		'idle' | 'copying' | 'copied' | 'error'
	>('idle');

	useEffect(() => {
		//notification message to appear for 10 seconds
		if (!copyStatus) return;

		const timeout = window.setTimeout(() => setCopyStatus('idle'), 10_000);
		return () => window.clearTimeout(timeout);
	}, [copyStatus]);

	async function copyAppLink() {
		if (isDisabled || !isPublished || !deepLink) return;
		setCopyStatus('copying');
		try {
			await navigator.clipboard.writeText(deepLink);
			setCopyStatus('copied');
		} catch {
			setCopyStatus('error');
		}
	}

	return (
		<Stack>
			<InlineWrap>
				<QRCodeSVG
					value={deepLink}
					size={160}
					marginSize={4}
					title={title}
					role="img"
				/>
				<Button
					variant="secondary"
					icon="content_copy"
					onPress={copyAppLink}
					isDisabled={copyStatus === 'copying'}
				>
					{copyStatus === 'copying' ? 'Copying app link...' : 'Copy app link'}
				</Button>
			</InlineWrap>
			<div role="status">
				{copyStatus === 'copied' && (
					<InlineMessage level="success">App link copied.</InlineMessage>
				)}
				{copyStatus === 'error' && (
					<InlineMessage level="error">
						Could not copy the app link. Check clipboard permissions and try
						again.
					</InlineMessage>
				)}
			</div>
		</Stack>
	);
}
