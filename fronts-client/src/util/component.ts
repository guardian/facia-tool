/**
 * Given an event handler, provides both click and onEnter keyboard handlers to spread
 * into components for a single event. For better a11y.
 * e.g. <Component {...optionize(clickHandler)} />
 */
function optionize(handlerFn: (value: string | void) => void) {
	return {
		role: 'option',
		onClick: (e: MouseEvent) =>
			handlerFn(
				e.target instanceof HTMLInputElement ? e.target.value : undefined,
			),
		onKeyDown: (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement && event.code === '13') {
				handlerFn(
					event.target instanceof HTMLInputElement
						? event.target.value
						: undefined,
				);
			}
		},
	};
}

export { optionize };
