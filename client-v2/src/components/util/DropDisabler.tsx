import React from 'react';

interface DropDisablerChildren {
  children: React.ReactNode;
  style: React.HTMLAttributes<HTMLDivElement>['style'];
}

// This component prevents the default behaviour for drop events on this node,
// or its child nodes. When dropping links (perhaps when missing a drop
// zone), the default behaviour is navigating to the linked document
const DropDisabler = ({ children, style }: DropDisablerChildren) => (
  <div
    style={style}
    onDragOver={e => e.preventDefault()}
    onDrop={e => e.preventDefault()}
  >
    {children}
  </div>
);

export default DropDisabler;
