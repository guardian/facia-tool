import type { FeastCollectionCardMeta } from './Collection';

export type PackageCardType = 'recipe' | 'chef' | 'subcollection';

export interface PackageItem {
	id: string;
	cardType: PackageCardType;
	addedOn: number;
	metadata?: unknown;
}

export interface FeastPackageMetadata {
	theme?: FeastCollectionCardMeta['feastCollectionTheme'];
	bodyText?: string;
	targetedRegions?: string[];
	excludedRegions?: string[];
}

export interface FeastPackageHeader {
	id: string;
	name: string;
	packageType: 'Feast';
	isHidden: boolean;
	metadata?: FeastPackageMetadata;
	createdOn?: number;
	createdBy?: string;
	createdEmail?: string;
	updatedOn?: number;
	updatedBy?: string;
	updatedEmail?: string;
}

export type FeastPackage = FeastPackageHeader & { items: PackageItem[] };

export interface CreatePackageRequest {
	id: string;
	name: string;
	packageType: 'Feast';
	isHidden: boolean;
	metadata?: FeastPackageMetadata;
}

export interface WritePackageRequest {
	name: string;
	packageType: 'Feast';
	isHidden: boolean;
	metadata?: FeastPackageMetadata;
	items: PackageItem[];
}

export interface PackageEditorState {
	value: FeastPackage;
	isPersisted: boolean;
	isModified: boolean;
}

export interface PackageItemDisplay {
	title: string;
	imageUrl?: string;
}

export type PackageVisibility = 'All' | 'Visible' | 'Hidden';
