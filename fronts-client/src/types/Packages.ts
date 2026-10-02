export interface FeastPackage {
	id: string;
	displayName: string;
	status: 'LIVE' | 'DRAFT' | 'ARCHIVED';
	isModified?: boolean;
	standfirst: string;
	metadata?: {
		v1MetadataGap?: string;
		prefillToggle?: boolean;
	};
	slots: PackageRecipe[];
	deepLinkUrl?: string;
	createdAt?: number;
	updatedAt?: number;
}

export interface PackageRecipe {
	id: string;
	title: string;
	imageUrl?: string;
	position: number;
}

// Chef objects might look like:
export interface PackageChef {
	id: string;
	name: string;
	image?: string;
	bio?: string;
}

export type PackageStatus = 'All' | 'Draft' | 'Live' | 'Archived';
