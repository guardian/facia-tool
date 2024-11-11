export const attemptFriendlyErrorMessage = (e: unknown) => {
	if ((e as Response).status && (e as Response).statusText) {
		return `${(e as Response).status}: ${(e as Response).statusText}`;
	}
	if (e instanceof Error) {
		return e.message;
	}
	return `${e}`;
};
