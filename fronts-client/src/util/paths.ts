const getPathFromUri = (uri: string): string | void => {
  const [, path = ''] = /https:\/\/www\.theguardian.com(.+)/.exec(uri) || [];
  return path;
};

const ophanURIFromPath = (path: string) =>
  `https://dashboard.ophan.co.uk/info?path=${path}`;

const liveURIFromPath = (path: string) => `https://www.theguardian.com/${path}`;

const previewURIFromPath = (path: string) =>
  `https://preview.gutools.co.uk/${path}`;

const getPaths = (uri: string) => {
  const path = /https:\/\/www\.theguardian.com(.+)/.test(uri)
    ? getPathFromUri(uri)
    : uri;

  return path
    ? {
        ophan: ophanURIFromPath(path),
        live: liveURIFromPath(path),
        preview: previewURIFromPath(path),
      }
    : {
        ophan: undefined,
        live: undefined,
        preview: undefined,
      };
};

export { getPaths };
