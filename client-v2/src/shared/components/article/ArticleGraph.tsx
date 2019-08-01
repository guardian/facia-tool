import React from 'react';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { PageViewDataSeriesDataPoint } from 'shared/types/PageViewData';
import { theme } from '../../../constants/theme';

interface ArticleGraphProps {
  data?: PageViewDataSeriesDataPoint[];
}

class ArticleGraph extends React.Component<ArticleGraphProps> {
  render() {
    const { data } = this.props;

    return (
      <AreaChart
        width={40}
        height={14}
        data={data}
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
    );
  }
}

export default ArticleGraph;
