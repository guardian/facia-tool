import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Prompt } from 'react-router-dom';
import v4 from 'uuid/v4';
import { styled } from 'constants/theme';
import { RecipeSearchContainer } from 'components/feed/RecipeSearchContainer';
import notifications from 'services/notifications';
import {
	createPackage,
	fetchPackage,
	fetchPackages,
	packageErrorMessage,
	PackageNotFound,
	PackageUnknownError,
	publishPackage,
	writePackage,
} from 'services/packagesApi';
import type {
	FeastPackage,
	FeastPackageHeader,
	PackageEditorState,
	PackageVisibility,
} from 'types/Packages';
import PackageCollectionBuilder from './PackageCollectionBuilder';
import PackageListHeader from './PackageListHeader';
import PackageListView from './PackageListView';
import { Button } from '@guardian/stand/Button';

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	top: 60px;
	height: calc(100vh - 60px);
	background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
	display: flex;
	flex: 1;
	min-height: 0;
`;

const LeftPanel = styled.div`
	width: 35%;
	border-right: 1px solid #ddd;
	background: white;
	overflow-y: auto;
	padding: 20px;
`;

const RightPanel = styled.div`
	width: 65%;
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
`;

const ManageFeastPackages: React.FC = () => {
	const [packages, setPackages] = useState<FeastPackageHeader[]>([]);
	const [editor, setEditor] = useState<PackageEditorState | null>(null);
	const [visibility, setVisibility] = useState<PackageVisibility>('All');
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshVersion, setRefreshVersion] = useState(0);

	const busyRef = useRef(false);
	const updateBusy = (value: boolean) => {
		busyRef.current = value;
		setBusy(value);
	};
	const [publishMessage, setPublishMessage] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		const controller = new AbortController();

		setLoading(true);
		setError(null);

		const timer = window.setTimeout(
			async () => {
				try {
					const result = await fetchPackages(query, controller.signal);

					if (active) {
						setPackages(result);
					}
				} catch (requestError) {
					if (active) {
						const message = await packageErrorMessage(requestError);

						if (active) {
							setError(message);
						}
					}
				} finally {
					if (active) {
						setLoading(false);
					}
				}
			},
			query.trim() ? 300 : 0,
		);

		return () => {
			active = false;
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [query, refreshVersion]);

	useEffect(() => {
		if (!editor?.isModified && !busy) {
			return;
		}

		const beforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', beforeUnload);

		return () => {
			window.removeEventListener('beforeunload', beforeUnload);
		};
	}, [editor?.isModified, busy]);

	const filteredPackages = useMemo(
		() =>
			packages.filter((pkg) => {
				if (visibility === 'All') {
					return true;
				}

				return visibility === 'Hidden' ? pkg.isHidden : !pkg.isHidden;
			}),
		[packages, visibility],
	);

	const canLeaveEditor = () =>
		!busyRef.current &&
		(!editor?.isModified ||
			window.confirm('Discard your unsaved package changes?'));

	const reportError = async (requestError: unknown) => {
		const message = await packageErrorMessage(requestError);

		setError(message);
		notifications.notify({
			message,
			level: 'error',
		});
	};

	const handleSelectPackage = async (id: string) => {
		if (editor?.value.id === id || !canLeaveEditor()) {
			return;
		}

		setPublishMessage(null);

		updateBusy(true);
		setError(null);

		try {
			const value = await fetchPackage(id);

			if (value === undefined) {
				setError('Package not found.');
				return;
			}

			setEditor({
				value,
				isPersisted: true,
				isModified: false,
			});
		} catch (requestError) {
			await reportError(requestError);
		} finally {
			updateBusy(false);
		}
	};

	const handleCreateNewPackage = () => {
		if (!canLeaveEditor()) {
			return;
		}

		setPublishMessage(null);

		setError(null);
		setEditor({
			value: {
				id: v4(),
				name: '',
				packageType: 'Feast',
				isHidden: true,
				metadata: {},
				items: [],
			},
			isPersisted: false,
			isModified: true,
		});
	};

	const handleClosePackage = () => {
		if (!canLeaveEditor()) {
			return;
		}

		setPublishMessage(null);
		setEditor(null);
		setError(null);
	};

	const handlePackageChange = (value: FeastPackage) => {
		if (busyRef.current) {
			return;
		}

		setPublishMessage(null);

		setEditor((current) =>
			current
				? {
						...current,
						value,
						isModified: true,
					}
				: current,
		);
	};

	const robustWrite = async (value: FeastPackage, attempt: number = 0) => {
		if (attempt > 3) {
			console.error('Could not write after 3 attempts, giving up');
			throw new PackageUnknownError('Could not write after 3 attempts', null);
		}

		try {
			return await writePackage(value.id, {
				name: value.name.trim(),
				packageType: 'Feast',
				isHidden: value.isHidden,
				metadata: value.metadata,
				items: value.items,
			});
		} catch (err) {
			if (err instanceof PackageNotFound) {
				// The package does not exist yet, so create it
				await createPackage({
					id: value.id,
					name: value.name.trim(),
					packageType: 'Feast',
					isHidden: value.isHidden,
				});
				return await robustWrite(value, attempt + 1);
			} else {
				throw err;
			}
		}
	};
	const handleSave = async () => {
		if (!editor || busyRef.current) {
			return;
		}

		if (!editor.value.name.trim()) {
			setError('Enter a package name before saving.');
			return;
		}

		setPublishMessage(null);

		updateBusy(true);
		setError(null);

		try {
			const saved = await robustWrite(editor.value);

			setEditor({
				value: saved,
				isPersisted: true,
				isModified: false,
			});
			setRefreshVersion((version) => version + 1);
		} catch (requestError) {
			await reportError(requestError);
		} finally {
			updateBusy(false);
		}
	};

	const handlePublish = async () => {
		if (!editor || busyRef.current) {
			return;
		}

		if (!editor.isPersisted || editor.isModified) {
			setError('Save the package before publishing.');
			return;
		}

		if (!editor.value.name.trim()) {
			setError('Enter and save a package name before publishing.');
			return;
		}

		const confirmed = window.confirm(
			editor.value.isHidden
				? 'Submit this saved package for publication? It will remain hidden from fronts.'
				: 'Submit this saved package for publication?',
		);

		if (!confirmed) {
			return;
		}

		updateBusy(true);
		setError(null);
		setPublishMessage(null);

		try {
			await publishPackage(editor.value.id);

			setPublishMessage(
				'Publication submitted. It may take up to 30mins to show in the app.',
			);
		} catch (requestError) {
			await reportError(requestError);
		} finally {
			updateBusy(false);
		}
	};

	return (
		<PageContainer>
			<Prompt
				when={busy || !!editor?.isModified}
				message={
					busy
						? 'A package request is in progress. Leave this page?'
						: 'Discard your unsaved package changes?'
				}
			/>

			<ContentWrapper>
				<LeftPanel>
					<RecipeSearchContainer />
				</LeftPanel>

				<RightPanel>
					<PackageListHeader
						query={query}
						onQueryChange={setQuery}
						searchResults={filteredPackages}
						loading={loading}
						visibility={visibility}
						onVisibilityChange={setVisibility}
						hasUnsavedChanges={!!editor?.isModified}
						disabled={busy}
						onPackageSelected={(id) => {
							void handleSelectPackage(id);
						}}
						onCreateNewPackage={handleCreateNewPackage}
						onClose={handleClosePackage}
					/>

					{error && <p role="alert">{error}</p>}

					{publishMessage && <p role="status">{publishMessage}</p>}

					{busy && <p role="status">Package request in progress...</p>}

					{editor ? (
						<PackageCollectionBuilder
							key={editor.value.id}
							package={editor.value}
							isPersisted={editor.isPersisted}
							isModified={editor.isModified}
							disabled={busy}
							onPackageChange={handlePackageChange}
							onSave={() => {
								void handleSave();
							}}
							onPublish={() => {
								void handlePublish();
							}}
							onClose={handleClosePackage}
						/>
					) : loading ? (
						<p role="status">Loading packages...</p>
					) : error ? (
						<Button onClick={() => setRefreshVersion((version) => version + 1)}>
							Retry
						</Button>
					) : (
						<PackageListView
							packages={filteredPackages}
							visibility={visibility}
							disabled={busy}
							onSelectPackage={(id) => {
								void handleSelectPackage(id);
							}}
							onCreateNew={handleCreateNewPackage}
						/>
					)}
				</RightPanel>
			</ContentWrapper>
		</PageContainer>
	);
};

export default ManageFeastPackages;
