// @flow
import { pandaFetch } from './pandaFetch';

export default function getFrontsConfig() {
  return pandaFetch(`config`, {
    method: 'get',
    credentials: 'same-origin'
  });
}
