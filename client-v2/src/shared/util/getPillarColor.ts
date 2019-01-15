const pillarColorMap = {
  'pillar/news': '#c70000',
  'pillar/sport': '#0084c6',
  'pillar/opinion': '#e05e00',
  'pillar/lifestyle': '#bb3b80',
  'pillar/arts': '#a1845c'
} as { [pillar: string]: string };

const notLiveColour = '#ff7f0f';
const noPillarColour = '#221133';

export const getPillarColor = (
  pillar: string | undefined,
  isLive?: boolean
) => {
  if (!isLive) {
    return notLiveColour;
  }

  if (!pillar) {
    return noPillarColour;
  }

  return pillarColorMap[pillar];
};
