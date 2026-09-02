import { styled } from 'constants/theme';

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

export const ListHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
`;

export const List = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;
`;

export const ListItem = styled.li`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 12px 16px;
	margin-bottom: 8px;
	background-color: ${({ theme }) => theme.base.colors.backgroundColorLight};
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 4px;
`;

export const ListItemTitle = styled.span`
	font-size: 15px;
	font-weight: 500;
	color: ${({ theme }) => theme.base.colors.textDark};
`;

export const ListItemMeta = styled.span`
	display: block;
	font-size: 12px;
	color: ${({ theme }) => theme.base.colors.textMuted};
`;

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
	color: ${({ theme }) => theme.base.colors.textLight};
	background-color: ${({ theme, draft }) =>
		draft ? theme.base.colors.brandColor : theme.base.colors.button};
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
 * Images
 */

export const ImageRow = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px 0;
	border-top: 1px solid ${({ theme }) => theme.base.colors.borderColor};

	&:first-of-type {
		border-top: none;
		padding-top: 0;
	}
`;

export const ImageRowHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
`;

export const ImagePicker = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const ImageThumb = styled.div`
	width: 100%;
	max-width: 320px;
	aspect-ratio: 5 / 3;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 3px;
`;

export const ImageEmpty = styled.div<{ isDragging?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	width: 100%;
	max-width: 320px;
	aspect-ratio: 5 / 3;
	padding: 12px;
	font-size: 12px;
	color: ${({ theme }) => theme.base.colors.textMuted};
	border: 2px dashed
		${({ theme, isDragging }) =>
			isDragging
				? theme.base.colors.brandColor
				: theme.base.colors.borderColor};
	border-radius: 3px;
	background-color: ${({ theme }) => theme.base.colors.backgroundColorFocused};
`;

export const ImagePickerActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;
