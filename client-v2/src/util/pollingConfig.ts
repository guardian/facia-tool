import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';

export default (store: Store) =>
  setInterval(
    () => (store.dispatch as Dispatch)(fetchStaleOpenCollections()),
    10000
  );
