// @flow

import * as React from 'react';

type CAPIParameterBuilderProps = {
  children: (params: Object) => React.Node,
  params: { [key: string]: string }
};

type CAPIParameterBuilderState = {
  params: { [key: string]: string }
};

class CAPIParameterBuilder extends React.Component<
  CAPIParameterBuilderProps,
  CAPIParameterBuilderState
> {
  constructor(props: CAPIParameterBuilderProps) {
    super(props);

    this.state = { params: { ...this.props.params } };
  }

  state: CAPIParameterBuilderState = {
    params: {}
  };

  handleClick = (e: SyntheticEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;

    this.setState({
      params: {
        ...this.state.params,
        [name]: value
      }
    });
  };

  render() {
    const { params } = this.props;

    return (
      <div>
        {Object.keys(params).map(param => (
          <input
            type="text"
            name={param}
            defaultValue={params[param]}
            onChange={this.handleClick}
          />
        ))}
        {this.props.children(this.state.params)}
      </div>
    );
  }
}

export default CAPIParameterBuilder;
