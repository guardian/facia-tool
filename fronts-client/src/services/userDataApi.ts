import { FeatureSwitch } from 'types/Features';
import { NestedCard } from 'types/Collection';
import pandaFetch from './pandaFetch';

const saveFeatureSwitch = async (featureSwitch: FeatureSwitch) => {
  try {
    await pandaFetch('/userdata/featureSwitch', {
      method: 'put',
      body: JSON.stringify(featureSwitch),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to persist feature switch, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
};

async function saveOpenFrontIds(frontsByPriority?: {
  [priority: string]: string[];
}): Promise<void> {
  try {
    await pandaFetch(`/userdata/frontIdsByPriority`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(frontsByPriority),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to store the open fronts configuration but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveFavouriteFrontIds(favouriteFrontsByPriority?: {
  [priority: string]: string[];
}): Promise<void> {
  try {
    await pandaFetch(`/userdata/favouriteFrontIdsByPriority`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(favouriteFrontsByPriority),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to store the favourite fronts configuration but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveClipboard(
  clipboardContent: NestedCard[]
): Promise<NestedCard[]> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/userdata/clipboard`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(clipboardContent),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to update a clipboard but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

export {
  saveClipboard,
  saveFavouriteFrontIds,
  saveOpenFrontIds,
  saveFeatureSwitch
};
