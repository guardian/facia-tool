import { CONST } from 'modules/vars';
import metaFields from 'constants/article-meta-fields';

function isPageBreakingNews() {
    const url = new URL(window.location);
    return url.pathname.includes('breaking-news') || url.searchParams.get('layout').includes('breaking-news');
}

const metaFieldsForBreakingNews = Object.freeze(
    metaFields.map(field => {
        if (field.key === 'headline') {
            return Object.assign({}, field, { maxLength: CONST.restrictedHeadlineLength });
        }
        return field;
    })
);

/**
 * If on a breaking news page, returns the metaFields array modified to limit the headline
 * to the restrictedHeadlineLength constant, else the default metaFields array.
 */
export function metaFieldsForPage() {
    return isPageBreakingNews() ? metaFieldsForBreakingNews : metaFields;
}
