import {
	IntendedAudienceSignifierProps,
	mapTagsToSourceAndTarget,
} from '@guardian/stand/IntendedAudienceSignifier';
import { Tag } from 'types/Capi';

export function intendedAudienceFromTags(tags: Tag[]):
	| {
			source: IntendedAudienceSignifierProps['source'];
			target: IntendedAudienceSignifierProps['target'];
	  }
	| undefined {
	return mapTagsToSourceAndTarget(tags.map((tag) => ({ path: tag.id })));
}
