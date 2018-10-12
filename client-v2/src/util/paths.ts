

const getPathFromUri = (uri: string): string | void => {
  const [, path] = /https:\/\/www\.theguardian.com(.+)/.exec(uri);
  return path;
};

const ophanURIFromPath = (path: string) =>
  `https://dashboard.ophan.co.uk/info?path=${path}`;

const getPaths = (uri: string) => {
  const path = getPathFromUri(uri);

  return path
    ? {
        ophan: ophanURIFromPath(path)
      }
    : {
        ophan: null
      };
};

export { getPaths };
