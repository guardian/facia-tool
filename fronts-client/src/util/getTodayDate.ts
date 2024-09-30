const getTodayDate = () => {
	const d = new Date();
	return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
		.map((p) => {
			return p < 10 ? '0' + p : p;
		})
		.join('-');
};

export { getTodayDate };
