type EditionsArticle = any;

interface EditionsPrefill {
	queryString: string;
}

interface EditionsCollection {
	id: string;
	displayName: string;
	prefill?: EditionsPrefill;
	isHidden: boolean;
	lastUpdated?: number;
	updatedBy?: string;
	updatedEmail?: string;
	items: EditionsArticle[];
}

interface EditionsFront {
	id: string;
	displayName: string;
	isHidden: boolean;
	updatedOn?: number;
	updatedBy?: string;
	updatedEmail?: string;
	collections: EditionsCollection[];
}

interface EditionsIssue {
	id: string;
	edition: string;
	issueDate: string; // YYYY-MM-dd
	createdOn: number;
	createdBy: string;
	createdEmail: string;
	launchedOn?: number;
	launchedBy: string;
	launchedEmail: string;
	fronts: EditionsFront[];
	supportsProofing: boolean;
	lastProofedVersion?: string;
	platform: string;
}

const issueVersionStatus = [
	'Started',
	'Proofing',
	'Proofed',
	'Publishing',
	'Published',
	'Failed',
	'Processing',
] as const;

type IssueVersionStatus = (typeof issueVersionStatus)[number];

interface IssueVersionEvent {
	eventTime: number;
	status: IssueVersionStatus;
	message?: string;
}

interface IssueVersion {
	id: string;
	launchedOn: number;
	launchedBy: string;
	launchedEmail: string;
	events: IssueVersionEvent[];
}

export {
	EditionsIssue,
	EditionsFront,
	EditionsCollection,
	EditionsArticle,
	EditionsPrefill,
	IssueVersionStatus,
	IssueVersionEvent,
	IssueVersion,
};
