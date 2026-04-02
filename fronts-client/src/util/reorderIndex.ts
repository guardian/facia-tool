import type { ItemDropTarget } from 'react-aria-components';

/**
 * Converts react-aria's ItemDropTarget (a relative position) into the absolute
 * destination index expected by the moveFrontCollection / editorMoveFront Redux
 * actions, which use: splice(fromIndex, 1) then splice(newIndex, 0, id).
 */
export function reorderIndex(
	items: readonly string[],
	draggedId: string,
	target: ItemDropTarget,
): number {
	const fromIndex = items.indexOf(draggedId);
	let toIndex = items.indexOf(String(target.key));

	if (target.dropPosition === 'after') {
		toIndex += 1;
	}

	// Once the dragged item is removed, items after its original position shift
	// left by 1, so we adjust the insertion index accordingly.
	if (fromIndex < toIndex) {
		toIndex -= 1;
	}

	return Math.max(0, Math.min(toIndex, items.length - 1));
}
