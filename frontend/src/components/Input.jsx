import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  options = [], // for select type
  ...props
}) => {
  const inputId = props.id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  const inputStyles = `w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
    error
      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
      : 'border-slate-300/80 focus:ring-olive-green/25 focus:border-olive-green'
  }`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-650 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500 font-extrabold">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={inputStyles}
          required={required}
          {...props}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputStyles} min-h-24 resize-y`}
          required={required}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputStyles}
          required={required}
          {...props}
        />
      )}

      {error && (
        <p className="text-xs text-rose-500 mt-0.5">{error}</p>
      )}
    </div>
  );
};

export default Input;
