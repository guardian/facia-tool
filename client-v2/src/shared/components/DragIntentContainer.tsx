import React from 'react';

type Props = {
  onIntentConfirm: () => void;
  onDragIntentStart: () => void;
  onDragIntentEnd: () => void;
  active: boolean;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

class DragIntentContainer extends React.Component<Props> {
  private dragTimer: number | null = null;

  // Keeps track of dragEvents over the Collection's toggleVisibility button
  // to determine enter/leave events
  private dragHoverDepth: number = 0;

  public handleToggleButtonDragEnter = () => {
    if (this.dragHoverDepth === 0 && this.props.active) {
      this.registerDragIntent();
    }
    this.dragHoverDepth += 1;
  };

  public handleToggleButtonDragLeave = () => {
    this.dragHoverDepth -= 1;
    if (this.dragHoverDepth === 0) {
      this.deregisterDragIntent();
    }
  };

  public handleToggleButtonDrop = () => {
    this.dragHoverDepth = 0;
    this.deregisterDragIntent();
  };

  public registerDragIntent = () => {
    // only register if active
    // all other events will fire even if not active to allow the parent
    // to reset its state that was created when drag intent was initialised
    if (this.props.active) {
      this.props.onDragIntentStart();
      this.dragTimer = window.setTimeout(() => {
        this.props.onIntentConfirm();
        this.deregisterDragIntent();
      }, 300);
    }
  };

  public deregisterDragIntent = () => {
    if (this.dragTimer) {
      window.clearTimeout(this.dragTimer);
    }
    this.dragTimer = null;
    this.props.onDragIntentEnd();
  };

  public render() {
    const {
      children,
      active, // active prop must be destructured here so it's not passed into div props
      onIntentConfirm,
      onDragIntentStart,
      onDragIntentEnd,
      ...props
    }: Props = this.props;

    return (
      <div
        {...props}
        onDragEnter={this.handleToggleButtonDragEnter}
        onDragLeave={this.handleToggleButtonDragLeave}
        onDrop={this.handleToggleButtonDrop}
      >
        {children}
      </div>
    );
  }
}

export default DragIntentContainer;
