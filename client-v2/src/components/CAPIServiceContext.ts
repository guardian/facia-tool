import { createContext } from 'react';
import capiQuery from 'services/capiQuery';

export default createContext({
  capiLiveService: capiQuery(),
  capiPreviewService: capiQuery()
});
