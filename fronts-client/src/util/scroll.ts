/**
 * Scroll an element to the given value, animated over the duration.
 * Uses an easing function.
 */
export function scrollToLeft(
	element: HTMLElement,
	to: number,
	duration: number,
) {
	const start = element.scrollLeft;
	const change = to - start;
	const startTime = Date.now();
	const endTime = startTime + duration;
	let currentTime = startTime;

	const animateScroll = () => {
		currentTime += Date.now() - currentTime;
		const val = easeInOutQuad(currentTime - startTime, start, change, duration);
		element.scrollLeft = val;
		if (currentTime < endTime) {
			requestAnimationFrame(animateScroll);
		} else {
			element.scrollLeft = to;
		}
	};
	animateScroll();
}

const easeInOutQuad = (
	currentTime: number,
	startValue: number,
	changeInValue: number,
	duration: number,
) => {
	currentTime /= duration / 2;
	if (currentTime < 1) {
		return (changeInValue / 2) * currentTime * currentTime + startValue;
	}
	currentTime--;
	return (
		(-changeInValue / 2) * (currentTime * (currentTime - 2) - 1) + startValue
	);
};
