import React from 'react';
import '../../styles/loading.css';

const LoadingComponent = props => {
  if (props.error) {
    return <div className=""> Error Loading. Please reload page</div>;
  }

  return <div className="loader">Loading</div>;
};

export default LoadingComponent;
