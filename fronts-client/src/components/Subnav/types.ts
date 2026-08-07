/**
 * Types mirroring the CustomSubnav model from facia-scala-client
 * (com.gu.facia.client.models). See app/services/CustomSubnavApi.scala.
 *
 * Phase one only edits the header, links and targeted pages. `images` and
 * `palette` are part of the model but are not yet surfaced in the UI.
 */

export type TargetedPageType = 'front' | 'article' | 'hasTag';

export type CustomSubnavFormat = 'large' | 'compact';

export type ImageBreakpoint = 'mobile' | 'tablet' | 'web';

export interface SubnavLink {
	linkText: string;
	dotcomPath: string;
}

export interface TargetedPage {
	type: TargetedPageType;
	path: string;
}

export interface CustomSubnavHeader {
	headerText: string;
	dotcomPath?: string;
	copy: string;
}

export interface SubnavImage {
	imageSrc: string;
	breakpoint: ImageBreakpoint;
}

export interface Palette {
	text?: string;
	header?: string;
	link?: string;
}

export interface Palettes {
	light: Palette;
	dark: Palette;
}

export interface CustomSubnav {
	id: string;
	header: CustomSubnavHeader;
	format: CustomSubnavFormat;
	links: SubnavLink[];
	pages: TargetedPage[];
	images?: SubnavImage[];
	palette?: Palettes;
	// Serialised as epoch milliseconds by the server (JodaFormat).
	lastUpdated: number;
	updatedBy: string;
	updatedEmail: string;
}

export interface CustomSubnavConfig {
	live: CustomSubnav[];
	draft: CustomSubnav[];
}
