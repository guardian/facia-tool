export const toneColorMap = {
  news: '#c70000',
  comment: '#ff7f0f',
  feature: '#bb3b80',
  media: '#0084c6',
} as { [tone: string]: string };


const notLiveColour = '#ff7f0f';

export const getToneColor = (tone?: string, isLive?: boolean) => {
    if (!isLive || !tone) {
      return notLiveColour;
    }
    return toneColorMap[tone];
  };
