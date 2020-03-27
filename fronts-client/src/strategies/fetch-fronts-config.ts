import {
  fetchEditionsIssueAsConfig,
  fetchFrontsConfig,
} from 'services/faciaApi';
import type { State } from 'types/State';
import { runStrategy } from './run-strategy';
import { FrontsConfig } from 'types/FaciaApi';

const fetchFrontsConfigStrategy = (state: State) =>
  runStrategy<Promise<FrontsConfig> | null>(state, {
    none: () => null,
    edition: (editionId) => fetchEditionsIssueAsConfig(editionId),
    front: () => fetchFrontsConfig(),
  });

export { fetchFrontsConfigStrategy };
