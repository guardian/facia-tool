import React from 'react';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { PageViewStory } from 'shared/types/PageViewData';
import { theme } from '../../../constants/theme';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { selectDataForArticle } from '../../../redux/modules/pageViewData/selectors';

interface ArticleGraphContainerProps {
  articleId: string;
  collectionId: string;
  frontId: string;
}

interface ArticleGraphComponentProps extends ArticleGraphContainerProps {
  data?: PageViewStory;
}

class ArticleGraph extends React.Component<ArticleGraphComponentProps> {
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
  return (state: State, props: ArticleGraphContainerProps) => ({
    data: selectDataForArticle(
      state,
      props.articleId,
      props.collectionId,
      props.frontId
    )
  });
};

export default connect(mapStateToProps)(ArticleGraph);
