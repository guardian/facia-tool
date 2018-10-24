import React from 'react';
import styled from 'styled-components';
import ToolTip from './HoverActionToolTip';

const HoverActionsDiv = styled('div')`
  display: flex;
  bottom: 0;
  justify-content: space-around;
`;

interface HoverButtonInterface {
  text: string;
  component: React.ComponentType<ButtonPropsForWrapper>;
}
export interface ButtonPropsForWrapper {
  showToolTip: () => void;
  hideToolTip: () => void;
}
interface WrapperProps<ButtonProps> {
  buttons: HoverButtonInterface[];
  buttonprops: ButtonProps;
}

interface WrapperState {
  isToolTipVisible: boolean;
  toolTipText: string;
}

class HoverActionsButtonWrapper<ButtonProps> extends React.Component<
  WrapperProps<ButtonProps>,
  WrapperState
> {
  constructor(props: WrapperProps<ButtonProps>) {
    super(props);
    this.state = {
      isToolTipVisible: false,
      toolTipText: ''
    };
  }

  public render() {
    const { buttons, buttonprops } = this.props;
    const { isToolTipVisible, toolTipText } = this.state;

    return (
      <HoverActionsDiv>
        {isToolTipVisible ? <ToolTip text={toolTipText} /> : null}
        {buttons.map(ButtonObj => (
          <ButtonObj.component
            key={ButtonObj.text}
            {...buttonprops}
            showToolTip={() => {
              this.setToolTipText(ButtonObj.text);
              this.showToolTip();
            }}
            hideToolTip={() => {
              this.hideToolTip();
            }}
          />
        ))}
      </HoverActionsDiv>
    );
  }

  private showToolTip = () => {
    this.setState({
      isToolTipVisible: true
    });
  };

  private hideToolTip = () => {
    this.setState({
      isToolTipVisible: false
    });
  };

  private setToolTipText = (text: string) =>
    this.setState((prevState: WrapperState) => ({
      ...prevState,
      toolTipText: text
    }));
}

export { HoverActionsButtonWrapper, HoverButtonInterface };
