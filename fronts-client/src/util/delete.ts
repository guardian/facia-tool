import { deleteIssue as deleteIssueAPI } from '../services/editionsApi';

export const deleteIssue = async (): Promise<string> => {
	const issue = window.location.href.substring(
		window.location.href.lastIndexOf('/') + 1,
	);
	const result = window.confirm(
		`Are you sure you wish to delete issue ${issue}? This cannot be undone.`,
	);
	return result ? await deleteIssueAPI(issue) : 'Cancelled';
};
