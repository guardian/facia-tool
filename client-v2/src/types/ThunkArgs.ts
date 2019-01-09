import capiQuery from 'services/capiQuery';

export interface ThunkArgs {
  capiLiveService: ReturnType<typeof capiQuery>;
  capiPreviewService: ReturnType<typeof capiQuery>;
}
