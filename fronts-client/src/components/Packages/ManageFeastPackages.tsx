import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Prompt } from 'react-router-dom';
import v4 from 'uuid/v4';
import { styled } from 'constants/theme';
import { RecipeSearchContainer } from 'components/feed/RecipeSearchContainer';
import { Typography } from '@guardian/stand/Typography';
import notifications from 'services/notifications';
import {
	createPackage,
	fetchPackage,
	fetchPackages,
	getHttpStatus,
	packageErrorMessage,
	publishPackage,
	writePackage,
} from 'services/packagesApi';
import type {
	FeastPackage,
	PackageEditorState,
	PackageVisibility,
	WritePackageRequest,
} from 'types/Packages';
import PackageCollectionBuilder from './PackageCollectionBuilder';
import PackageListHeader from './PackageListHeader';
import PackageListView from './PackageListView';

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: calc(100vh - 80px);
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
	const [packages, setPackages] = useState<FeastPackage[]>([]);
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

		const value = editor.value;

		const request: WritePackageRequest = {
			name: value.name.trim(),
			packageType: 'Feast',
			isHidden: value.isHidden,
			metadata: value.metadata,
			items: value.items,
		};

		try {
			//let saved: FeastPackage;

			let saved: FeastPackage | undefined;

			try {
				//saved = await writePackage(value.id, request);
				saved = (await writePackage(value.id, request)) ?? {
					...value,
					...request,
				};
			} catch (writeError) {
				if (getHttpStatus(writeError) !== 404) {
					throw writeError;
				}

				try {
					await createPackage({
						id: value.id,
						name: request.name,
						packageType: 'Feast',
						isHidden: request.isHidden,
						metadata: request.metadata,
					});
				} catch (createError) {
					if (getHttpStatus(createError) !== 409) {
						throw createError;
					}

					const newId = v4();
					setEditor((current) =>
						current?.value.id === value.id
							? {
									...current,
									value: { ...current.value, id: newId },
									isPersisted: false,
									isModified: true,
								}
							: current,
					);

					const message =
						'This package ID was created in another session. A new ID has been assigned; save again.';
					setError(message);
					notifications.notify({ message, level: 'error' });
					return;
				}

				// If this PUT fails, the next save retries the update rather
				// than trying to create the UUID again.
				setEditor((current) =>
					current?.value.id === value.id
						? { ...current, isPersisted: true }
						: current,
				);

				//saved = await writePackage(value.id, request);
				saved = (await writePackage(value.id, request)) ?? {
					...value,
					...request,
				};
			}

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
				'Publication submitted. Feast may take time to process the update.',
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
					<Typography element="h3" variant="headingSm">
						SEARCH LIBRARY
					</Typography>
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
						<button
							type="button"
							onClick={() => setRefreshVersion((version) => version + 1)}
						>
							Retry
						</button>
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
