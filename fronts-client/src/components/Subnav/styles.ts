import { styled } from 'constants/theme';

// Scopes the @guardian/stand Open Sans font to subnav components only
export const SubnavRoot = styled.div`
	font-family: 'Open Sans', sans-serif;
`;

export const SubnavContainer = styled.div`
	padding: 70px 20px 40px;
	max-width: 720px;
`;

export const SubnavContainerHeading = styled.h1`
	font-family: GHGuardianHeadline, Georgia, serif;
	font-size: 24px;
	font-weight: 500;
	margin-bottom: 16px;
`;

export const Message = styled.p`
	color: ${({ theme }) => theme.base.colors.textDark};
	font-size: 14px;
`;

export const SavedMessage = styled.p`
	font-size: 13px;
	color: ${({ theme }) => theme.base.colors.textMuted};
	margin: 0;
`;

export const BackButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: none;
	border: none;
	padding: 0;
	margin-bottom: 12px;
	font-size: 13px;
	color: ${({ theme }) => theme.base.colors.textDark};
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
`;

/**
 * List
 */

export const ListItemActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 6px;
	flex-shrink: 0;
`;

export const EditStatusBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 16px;
`;

export const StatusTag = styled.span<{ draft?: boolean }>`
	display: inline-block;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 2px 6px;
	margin-left: 8px;
	border-radius: 3px;
	color: ${({ theme, draft }) =>
		draft ? theme.base.colors.textLight : theme.base.colors.textDark};
	background-color: ${({ theme, draft }) =>
		draft ? theme.base.colors.brandColor : '#AED2A6'};
`;

export const Panel = styled.section`
	height: 100%;
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 4px;
	overflow: hidden;
`;

export const PanelThumb = styled.div<{ url: string }>`
	flex: 0 0 auto;
	width: 40px;
	height: 40px;
	border-radius: 3px;
	background-color: ${({ theme }) => theme.base.colors.backgroundColorFocused};
	background-image: url(${({ url }) => url});
	background-size: cover;
	background-position: center;
`;

/**
 * Form
 */

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const Section = styled.fieldset`
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 4px;
	padding: 16px;
	margin: 0;
`;

export const SectionHeading = styled.legend`
	font-size: 13px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: ${({ theme }) => theme.base.colors.textMuted};
	padding: 0 4px;
`;

export const Field = styled.label`
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-bottom: 12px;
	font-size: 13px;
	color: ${({ theme }) => theme.base.colors.textDark};
`;

export const TextInput = styled.input`
	height: 32px;
	padding: 0 8px;
	font-size: 14px;
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 3px;
	background-color: ${({ theme }) => theme.base.colors.backgroundColorLight};

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.base.colors.borderColorFocus};
	}
`;

export const Select = styled.select`
	height: 32px;
	padding: 0 8px;
	font-size: 14px;
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 3px;
	background-color: ${({ theme }) => theme.base.colors.backgroundColorLight};
`;

export const RepeatableRow = styled.div`
	display: flex;
	align-items: flex-end;
	gap: 8px;
	margin-bottom: 12px;
`;

export const RowFields = styled.div`
	display: flex;
	gap: 8px;
	flex: 1;

	> * {
		flex: 1;
	}
`;

export const DragHandle = styled.div`
	display: flex;
	align-items: center;
	align-self: flex-end;
	height: 2.5rem;
	color: ${({ theme }) => theme.base.colors.textMuted};
	cursor: grab;
	font-size: 18px;
`;

export const IconButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	align-self: flex-end;
	height: 2.5rem;
	padding: 0;
	background: none;
	border: none;
	color: ${({ theme }) => theme.base.colors.textDark};
	cursor: pointer;
	font-size: 24px;

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

export const AddRow = styled.div`
	display: flex;
	justify-content: flex-end;
`;

export const FormActions = styled.div`
	display: flex;
	gap: 8px;
`;

export const ErrorMessage = styled.p`
	color: ${({ theme }) => theme.base.colors.dangerColor};
	font-size: 13px;
	margin: 0;
`;

/**
 * Subnav create form (sidebar section nav + form content)
 */

// Clears the fixed app header so the grid sits below the top bar.
export const SubnavCreateFormPage = styled.div`
	padding-top: 60px;
	z-index: 0;
`;

export const CreateFormSidebar = styled.div`
	position: sticky;
	top: 80px;
	align-self: flex-start;
	width: 221px;
	margin: 0;
	padding: 0;
`;

export const CreateFormMain = styled.div`
	min-width: 0;
	max-width: 720px;
	display: flex;
	flex-direction: column;
	gap: 40px;
	padding: 0 40px 40px;
`;

export const CreateFormSection = styled.section<{ active?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-top: 16px;
	scroll-margin-top: 16px;
	padding-left: 24px;
	border-left: 2px solid
		${({ active, theme }) =>
			active ? theme.base.colors.textDark : theme.base.colors.borderColor};
	transition: border-color 0.15s ease;

	/* Keep the indicator bar aligned to the heading text, not its top margin. */
	> h1 {
		margin-top: 0;
	}
`;

export const CreateFormActions = styled.div`
	display: flex;
	justify-content: flex-start;
	gap: 8px;
`;
