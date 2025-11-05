import { CONST } from 'modules/vars';
import metaFields from 'constants/article-meta-fields';

function isPageBreakingNews() {
    const url = new URL(this.location);
    const layout = url.searchParams.get('layout') || '';
    return url.pathname.includes('breaking-news') || layout.includes('breaking-news');
}

const metaFieldsForBreakingNews = Object.freeze(
    metaFields.map(field => {
        if (field.key === 'headline') {
            return Object.assign({}, field, {
                showCharacterCountInsteadOfCharactersLeft: true,
                noRevertButton: true,
                lengthWarningMessages: [
                    [CONST.restrictedHeadlineLength, `${CONST.restrictedHeadlineLength} characters maximum`]
                ]
            });
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
