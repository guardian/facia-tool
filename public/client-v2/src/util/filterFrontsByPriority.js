// @flow

import type { FrontsConfig, FrontConfig, FrontDetail } from '../types/Fronts';

export default function filterFrontsByPriority(
  config: FrontsConfig,
  priority: string
): Array<FrontDetail> {
  const { fronts } = config;
  const frontIds: Array<string> = Object.keys(fronts);
  return frontIds.reduce((acc: Array<FrontDetail>, key: string) => {
    if (
      fronts[key].priority === priority ||
      (!fronts[key].priority && priority === 'editorial')
    ) {
      const frontConfig: FrontConfig = fronts[key];
      const frontDetail: FrontDetail = Object.assign({}, frontConfig, {
        id: key
      });
      acc.push(frontDetail);
    }
    return acc;
  }, []);
}
