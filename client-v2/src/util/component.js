function optionize(handlerFn: (e: Event) => void) {
  return {
    role: 'option',
    onClick: (e: Event) => handlerFn(e.target.value),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.keycode === 13) {
        handlerFn(event.target.value);
      }
    }
  };
}

export { optionize };
