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
	color: ${({ theme, draft }) =>
		draft ? theme.base.colors.textLight : theme.base.colors.textDark};
	background-color: ${({ theme, draft }) =>
		draft ? theme.base.colors.brandColor : '#AED2A6'};
`;

/**
 * Side-by-side draft / live panels
 */

export const Panel = styled.section`
	height: 100%;
	/* width: 50%; */
	border: 1px solid ${({ theme }) => theme.base.colors.borderColor};
	border-radius: 4px;
	overflow: hidden;
`;

export const PanelTopBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 8px 12px;
	background-color: ${({ theme }) => theme.base.colors.formBackground};
	border-bottom: 1px solid ${({ theme }) => theme.base.colors.borderColor};
`;

export const PanelTopBarMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const PanelList = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;
`;

export const PanelListItem = styled.li`
	display: flex;
	gap: 12px;
	padding: 12px;
	border-bottom: 1px solid ${({ theme }) => theme.base.colors.borderColor};

	&:last-child {
		border-bottom: none;
	}
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

export const PanelThumbButton = styled.button`
	flex: 0 0 auto;
	display: block;
	padding: 0;
	border: none;
	border-radius: 3px;
	background: none;
	line-height: 0;
	cursor: pointer;
`;

export const PanelTitleButton = styled.button`
	flex: 1;
	min-width: 0;
	display: block;
	padding: 0;
	border: none;
	background: none;
	color: inherit;
	text-align: left;
	text-decoration: underline;
	cursor: pointer;
`;

export const PanelEntryBody = styled.div`
	flex: 1;
	min-width: 0;
`;

export const PanelEntryRow = styled.div`
	display: flex;
	align-items: baseline;
	gap: 8px;
`;

export const PanelEntryStatus = styled.div`
	flex: 0 0 auto;
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
