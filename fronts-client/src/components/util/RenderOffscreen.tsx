import { styled } from 'constants/theme';

/**
 * Render an item offscreen. Useful when providing drag images to drag events,
 * which need to be rendered by the DOM before they appear at the cursor, but
 * don't belong on the page as the user sees it.
 */
export default styled.div`
	position: absolute;
	transform: translateX(-9999px);
`;
