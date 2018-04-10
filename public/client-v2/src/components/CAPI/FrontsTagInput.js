// @flow

import * as React from 'react';
import Downshift from 'downshift';
import CAPITagQuery from './CAPITagQuery';
import pandaFetch from '../../services/pandaFetch';

type CAPITagInputProps<T> = {
  onChange: (value: T) => void,
  placeholder?: string
};

const CAPITagInput = <T>({ onChange, placeholder }: CAPITagInputProps<T>) => (
  <Downshift
    itemToString={item => item.id}
    onChange={onChange}
    render={({
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      selectedItem,
      highlightedIndex,
      clearSelection
    }) => (
      <div>
        <input {...getInputProps({ placeholder })} />
        <button onClick={clearSelection}>Clear tag</button>
        {isOpen ? (
          <div style={{ border: '1px solid #ccc' }}>
            <CAPITagQuery
              debounce={500}
              baseURL="https://fronts.local.dev-gutools.co.uk/api/live/"
              fetch={pandaFetch}
              params={{ q: inputValue }}
            >
              {({ value }) =>
                value &&
                value.response.results.map((tag, index) => (
                  <div
                    {...getItemProps({ item: tag })}
                    key={tag.id}
                    style={{
                      backgroundColor:
                        highlightedIndex === index ? 'blue' : 'black',
                      fontWeight: selectedItem === tag ? 'bold' : 'normal'
                    }}
                  >
                    {tag.id}
                  </div>
                ))
              }
            </CAPITagQuery>
          </div>
        ) : null}
      </div>
    )}
  />
);

CAPITagInput.defaultProps = {
  placeholder: ''
};

export default CAPITagInput;
