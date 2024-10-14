import ttiPolyfill from 'tti-polyfill';
import { gtag } from 'services/GA';

ttiPolyfill.getFirstConsistentlyInteractive().then((tti: any) => {
	gtag('send', 'event', {
		eventCategory: 'Performance Metrics',
		eventAction: 'TTI',
		eventValue: tti,
		nonInteraction: true,
	});
});
