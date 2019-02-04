import React from 'react';

type Props = {
  onIntentConfirm?: () => void;
  onDragIntentStart: () => void;
  onDragIntentEnd: () => void;
  active: boolean;
  delay?: number;
  filterEvent?: (event: React.DragEvent) => boolean;
} & React.HTMLProps<HTMLDivElement>;

class DragIntentContainer extends React.Component<Props> {
  public static defaultProps = {
    active: true
  };

  private dragTimer: number | null = null;

  // Keeps track of dragEvents over the Collection's toggleVisibility button
  // to determine enter/leave events
  private dragHoverDepth: number = 0;

  public handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (this.props.onDragEnter) {
      this.props.onDragEnter(e);
    }
    if (this.dragHoverDepth === 0) {
      this.tryRegisterDragIntent(e);
    }
    this.dragHoverDepth += 1;
  };

  public handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    this.dragHoverDepth -= 1;
    if (this.props.onDragLeave) {
      this.props.onDragLeave(e);
    }
    if (this.dragHoverDepth === 0) {
      this.tryDeregisterDragIntent();
    }
  };

  public handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    this.dragHoverDepth = 0;
    if (this.props.onDrop) {
      this.props.onDrop(e);
    }
    this.tryDeregisterDragIntent();
  };

  public tryRegisterDragIntent = (e: React.DragEvent) => {
    // only register if active
    // all other events will fire even if not active to allow the parent
    // to reset its state that was created when drag intent was initialised
    const { delay, filterEvent } = this.props;
    if (!filterEvent || filterEvent(e)) {
      if (this.props.active) {
        this.props.onDragIntentStart();
        if (typeof delay !== 'undefined') {
          this.dragTimer = window.setTimeout(() => {
            if (this.props.onIntentConfirm) {
              this.props.onIntentConfirm();
            }
            this.tryDeregisterDragIntent();
          }, delay);
        } else {
          if (this.props.onIntentConfirm) {
            this.props.onIntentConfirm();
          }
        }
      }
    }
  };

  public tryDeregisterDragIntent = () => {
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
      filterEvent,
      ...props
    }: Props = this.props;

    return (
      <div
        {...props}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {children}
      </div>
    );
  }
}

export default DragIntentContainer;
