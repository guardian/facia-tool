import { getURLInternalPageCode } from 'util/CAPIUtils';

const urlToArticle = async (text: string) => {
  const id = await getURLInternalPageCode(text);

  return id
    ? {
        id,
        type: 'articleFragment'
      }
    : 'Can`t covert text to article';
};

export { urlToArticle };
