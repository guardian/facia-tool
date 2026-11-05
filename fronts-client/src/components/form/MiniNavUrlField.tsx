import React, { useCallback, useEffect, useState } from 'react';
import { Field, WrappedFieldProps } from 'redux-form';
import InputBase from 'components/inputs/InputBase';
import { styled, theme } from 'constants/theme';
import { error } from '../../styleConstants';
import { getMiniNavResolutionError, resolveMiniNavUrl } from 'services/miniNav';

const ValidationError = styled.div`
	color: ${error.primary};
	font-size: 12px;
	text-align: right;
`;

const ResolutionStatus = styled.div`
	color: ${theme.colors.greyMedium};
	font-size: 12px;
	text-align: left;
`;

interface Resolution {
	url: string;
	error?: string;
	title?: string;
}

const MiniNavInput = (
	props: WrappedFieldProps & { id: string; resolvedTitle?: string },
) => {
	const message = props.meta.error;
	const pending = message === 'Resolving custom subnav...';
	const errorId = `${props.id}-error`;
	const titleId = `${props.id}-title`;
	function getDescribedById() {
		if (message) return errorId;
		if (props.resolvedTitle) return titleId;
		return undefined;
	}

	const renderFeedback = () => {
		if (pending) {
			return (
				<ResolutionStatus id={errorId} role="status">
					{message}
				</ResolutionStatus>
			);
		}

		if (message) {
			return (
				<ValidationError id={errorId} role="alert">
					{message}
				</ValidationError>
			);
		}

		if (props.resolvedTitle) {
			return (
				<ResolutionStatus id={titleId} role="status">
					{props.resolvedTitle}
				</ResolutionStatus>
			);
		}

		return null;
	};

	return (
		<>
			<InputBase
				{...props.input}
				id={props.id}
				type="text"
				aria-invalid={!!message && !pending}
				aria-describedby={getDescribedById()}
			/>
			{renderFeedback()}
		</>
	);
};

export const MiniNavUrlField = ({
	value,
	id,
}: {
	value: string;
	id: string;
}) => {
	const [resolution, setResolution] = useState<Resolution>();

	useEffect(() => {
		setResolution(undefined);
		if (!value.trim()) {
			return;
		}
		let cancelled = false;
		const timer = setTimeout(async () => {
			try {
				const resolved = await resolveMiniNavUrl(value);
				if (!cancelled) {
					setResolution({ url: value, title: resolved.title });
				}
			} catch (error) {
				if (!cancelled) {
					setResolution({
						url: value,
						error: getMiniNavResolutionError(error),
					});
				}
			}
		}, 500);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [value]);

	const getValidationError = () => {
		if (!value.trim()) {
			return 'Enter a custom subnav URL.';
		}
		if (resolution?.url === value) {
			return resolution.error;
		}
		return 'Resolving custom subnav...';
	};

	const validationError = getValidationError();
	const validate = useCallback(() => validationError, [validationError]);

	return (
		<Field
			name="miniNavUrl"
			component={MiniNavInput}
			id={id}
			validate={validate}
			resolvedTitle={resolution?.url === value ? resolution.title : undefined}
		/>
	);
};
