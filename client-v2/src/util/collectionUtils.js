// @flow

import { getURLCAPIID } from 'util/CAPIUtils';

const urlToArticle = (text: string) => {
  const id = getURLCAPIID(text);

  return id
    ? {
        id,
        type: 'articleFragment'
      }
    : 'Can`t covert text to article';
};

export { urlToArticle };
