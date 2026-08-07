import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectHasSubnavPermission } from 'selectors/configSelectors';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { fetchSubnavConfig, upsertSubnav } from './subnavApi';
import SubnavForm from './SubnavForm';
import { CustomSubnav, CustomSubnavConfig } from './types';
import {
	List,
	ListHeader,
	ListItem,
	ListItemMeta,
	ListItemTitle,
	Message,
	StatusTag,
	SubnavContainer,
	SubnavContainerHeading,
} from './styles';

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

interface SubnavListEntry {
	subnav: CustomSubnav;
	isDraft: boolean;
}

/**
 * Build a de-duplicated list of subnavs for display. A subnav that exists in
 * both `draft` and `live` is shown once, tagged as a draft.
 */
const toListEntries = (config: CustomSubnavConfig): SubnavListEntry[] => {
	const draftIds = new Set(config.draft.map((s) => s.id));
	const draftEntries = config.draft.map((subnav) => ({
		subnav,
		isDraft: true,
	}));
	const liveOnlyEntries = config.live
		.filter((subnav) => !draftIds.has(subnav.id))
		.map((subnav) => ({ subnav, isDraft: false }));
	return [...draftEntries, ...liveOnlyEntries];
};

const SubnavSection = () => {
	const hasPermission = useSelector(selectHasSubnavPermission);

	const [config, setConfig] = useState<CustomSubnavConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const loadConfig = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			setConfig(await fetchSubnavConfig());
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Failed to load subnavs.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (hasPermission) {
			void loadConfig();
		}
	}, [hasPermission, loadConfig]);

	const handleSave = async (subnav: CustomSubnav) => {
		setIsSaving(true);
		try {
			const updated = await upsertSubnav(subnav);
			setConfig(updated);
			setIsCreating(false);
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Failed to save subnav.');
		} finally {
			setIsSaving(false);
		}
	};

	if (!hasPermission) {
		return <NoPermission />;
	}

	const entries = config ? toListEntries(config) : [];

	return (
		<SubnavContainer>
			<SubnavContainerHeading>Custom subnavs</SubnavContainerHeading>

			{isCreating ? (
				<SubnavForm
					onSave={handleSave}
					onCancel={() => setIsCreating(false)}
					saving={isSaving}
				/>
			) : (
				<>
					<ListHeader>
						<ButtonDefault
							type="button"
							priority="primary"
							onClick={() => setIsCreating(true)}
						>
							+ Create new subnav
						</ButtonDefault>
					</ListHeader>

					{loadError && <Message>{loadError}</Message>}

					{isLoading ? (
						<Message>Loading…</Message>
					) : entries.length === 0 ? (
						<Message>No custom subnavs yet. Create one to get started.</Message>
					) : (
						<List>
							{entries.map(({ subnav, isDraft }) => (
								<ListItem key={subnav.id}>
									<div>
										<ListItemTitle>
											{subnav.header.headerText || 'Untitled subnav'}
											<StatusTag draft={isDraft}>
												{isDraft ? 'Draft' : 'Live'}
											</StatusTag>
										</ListItemTitle>
										<ListItemMeta>
											{subnav.pages.length} page
											{subnav.pages.length === 1 ? '' : 's'} ·{' '}
											{subnav.links.length} link
											{subnav.links.length === 1 ? '' : 's'}
										</ListItemMeta>
									</div>
								</ListItem>
							))}
						</List>
					)}
				</>
			)}
		</SubnavContainer>
	);
};

export default SubnavSection;
