import React from 'react';

const FieldInput = ({
  className,
  input,
  label,
  defaultValue,
  type,
  meta: { touched, error }
}) => (
  <div className={className}>
    <label htmlFor={label}>
      {touched && error && <span className="">{error}</span>}
      <input {...input} type={type} placeholder={defaultValue} />
    </label>
  </div>
);

export default FieldInput;
