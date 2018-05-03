// @flow

const getPaths = (uri: string) => {
  const [, path] = /https:\/\/www\.theguardian.com(.+)/.exec(uri);

  return {
    ophan: `https://dashboard.ophan.co.uk/info?path=${path}`
  };
};

export { getPaths };
