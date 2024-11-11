import pandaFetch from 'services/pandaFetch';
import { isGuardianWebsiteUrl, getHostname } from './url';
import { attemptFriendlyErrorMessage } from './error';

interface OpenGraphData {
	title: string | undefined;
	description: string | undefined;
	siteName: string | undefined;
}

export default async function (url: string): Promise<OpenGraphData> {
	const isOnSite = isGuardianWebsiteUrl(url);
	try {
		const response = await pandaFetch(
			'/http/proxy/' + url + (isOnSite ? '?view=mobile' : ''),
		);
		const content = await response.text();
		const doc = document.createElement('div');
		doc.innerHTML = content;

		const graph: { [id: string]: string | null } = {};
		Array.from(doc.querySelectorAll('meta[property^="og:"]')).forEach((tag) => {
			const attributeKey = (tag.getAttribute('property') || '').replace(
				/^og\:/,
				'',
			);
			if (attributeKey) {
			}
			graph[attributeKey] = tag.getAttribute('content');
		});

		const titleTag = doc.querySelector('title');
		const title = titleTag ? titleTag.innerHTML.trim() : undefined;

		return {
			title: graph.title || title,
			description: graph.description || undefined,
			siteName: !isOnSite
				? graph.site_name || getHostname(url).replace(/^www\./, '')
				: undefined,
		};
	} catch (error) {
		throw new Error(
			`Unable to fetch ${url}: ${attemptFriendlyErrorMessage(error)}`,
		);
	}
}
