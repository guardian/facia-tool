import React from 'react';
import { theme } from 'shared/constants/theme';

interface IconProps {
  name?: string;
  fill?: string;
  size?: number;
  viewBox?: string;
}

const getPath = (name: string, props: any) => {
  switch (name) {
    case 'add-to-clipboard':
      return <path {...props} d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" />;
    case 'copy':
      return <path {...props} d="M8 2H2v6H0V0h8v2zM3 3h7v7H3V3z" />;
    case 'paste-sublink':
      return (
        <path
          {...props}
          d="M6.011 6.357l2.6-2.495L10 5.195 6.386 8.664l.003.003L5 10 0 5.2l1.39-1.333 2.604 2.5V0H6.01v6.357z"
        />
      );
    case 'ophan':
      return <path {...props} d="M0 5h2v5H0V5zm3-3h2v8H3V2zm3-2h2v10H6V0z" />;
    case 'view':
      return (
        <path
          {...props}
          d="M6.357 3.989l-2.495-2.6L5.195 0l3.469 3.614.003-.003L10 5 5.2 10 3.868 8.61l2.5-2.604H0V3.99h6.357z"
        />
      );
    case 'delete':
      return (
        <path
          {...props}
          d="M6.485 5.071L9.314 7.9 7.899 9.314 5.071 6.485 2.243 9.314.828 7.899l2.829-2.828L.828 2.243 2.243.828 5.07 3.657 7.9.828l1.415 1.415L6.485 5.07z"
        />
      );
    default:
      return <path />;
  }
};

export default ({
  name = '',
  fill = theme.colors.white,
  size = 10,
  viewBox = '0 0 10 10'
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    {getPath(name, { fill })}
  </svg>
);
