import React from 'react';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { PageViewStory } from 'shared/types/PageViewData';
import { theme } from '../../../constants/theme';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { createSelectDataForArticle } from '../../../redux/modules/pageViewData/selectors';

interface ArticleGraphProps {
  articleId: string;
  frontId: string;
  data?: PageViewStory;
}

class ArticleGraph extends React.Component<ArticleGraphProps> {
  public render() {
    const { data } = this.props;

    return (
      <>
        {data && data.totalHits > 0 && (
          <span>{data.totalHits.toLocaleString()}</span>
        )}
        <AreaChart
          width={40}
          height={14}
          data={data && data.data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="dateTime" hide={true} />
          <YAxis hide={true} />
          <Area
            type="monotone"
            dataKey="count"
            stroke={theme.shared.colors.greenDark}
            strokeWidth="1.5"
            fill={theme.shared.colors.greenLight}
          />
        </AreaChart>
      </>
    );
  }
}

const mapStateToProps = () => {
  const selectPageViewDataForArticleId = createSelectDataForArticle();
  return (state: State, props: ArticleGraphProps) => ({
    data: selectPageViewDataForArticleId(state, props.articleId, props.frontId)
  });
};

export default connect(mapStateToProps)(ArticleGraph);
