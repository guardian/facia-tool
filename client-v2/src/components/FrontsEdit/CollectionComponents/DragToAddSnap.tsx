import React, { useRef } from 'react';
import v4 from 'uuid/v4';
import { DragIcon } from 'shared/components/icons/Icons';
import { styled, theme } from 'constants/theme';
import RenderOffscreen from 'components/util/RenderOffscreen';
import {
  DraggingArticleComponent,
  dragOffsetX,
  dragOffsetY
} from './ArticleDrag';

const DragToAddSnapContainer = styled.div`
  border-top: 1px solid ${theme.shared.card.border};
  background-color: ${theme.shared.colors.whiteMedium};
  font-size: 12px;
  font-weight: bold;
  line-height: 18px;
  padding: 0 5px;
  cursor: pointer;

  &:hover {
    background-color: ${theme.shared.colors.whiteDark};
  }
  > a {
    text-decoration: none;
    &:hover {
      text-decoration: none;
    }
  }
`;

const handleDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  dragImageElement: HTMLDivElement | null
) => {
  // We must provide a unique URL for our snaplink, otherwise platforms might deduplicate
  // this content when rendering it on a front. Because we know that in a free-text snaplink,
  // the URL is not used, we supply a URL here that's a) guaranteed to be unique, and b)
  // gives some indication why it's there. When snaplinks don't need URLs, possibly because
  // there's a snap type for inserting arbitrary HTML, this will no longer be necessary.
  const uniqueId = v4().substr(0, 4);

  // We could also pass this as a custom drag type, which would arguably be cleaner, but require more code.
  const url = `https://www.theguardian.com/free-text-${uniqueId}?gu-headline=HTML%20snap%20--%20click%20to%20change%20content&gu-snapType=html`;

  // Setting both types re: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
  event.dataTransfer.setData('text/plain', url);
  event.dataTransfer.setData('text/uri-list', url);

  if (dragImageElement) {
    event.dataTransfer.setDragImage(dragImageElement, dragOffsetX, dragOffsetY);
  }
};

const DragToAddTextSnap = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <RenderOffscreen ref={ref}>
        <DraggingArticleComponent headline="Free text snaplink" />
      </RenderOffscreen>
      <DragToAddSnapContainer
        data-testid="drag-to-add-snap"
        onDragStart={e => handleDragStart(e, ref.current)}
        draggable={true}
      >
        <DragIcon /> Drag to add a text snap
      </DragToAddSnapContainer>
    </>
  );
};

export default DragToAddTextSnap;
