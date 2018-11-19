import React from 'react';

interface DropDisablerChildren {
  children: React.ReactNode;
}

// This component prevents the default behaviour for drop events on this node,
// or its child nodes. When dropping links (perhaps when missing a drop
// zone), the default behaviour is navigating to the linked document
const DropDisabler = ({ children }: DropDisablerChildren) => (
  <div onDragOver={e => e.preventDefault()} onDrop={e => e.preventDefault()}>
    {children}
  </div>
);

export default DropDisabler;
