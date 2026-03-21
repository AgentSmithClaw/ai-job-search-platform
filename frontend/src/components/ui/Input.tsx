import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2.5 text-sm
            bg-[var(--color-bg-surface)]
            border-2 rounded-[var(--radius-md)]
            border-[var(--color-border)]
            text-[var(--color-text)]
            placeholder:text-[var(--color-text-tertiary)]
            transition-all duration-150
            focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-focus)]
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs text-[var(--color-text-tertiary)]">{hint}</span>
        )}
        {error && (
          <span className="text-xs text-[var(--color-error)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxChars?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxChars, className = '', id, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="text-sm font-semibold text-[var(--color-text)]">
              {label}
            </label>
          )}
          {maxChars && (
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {charCount}/{maxChars}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          className={`
            w-full px-3 py-2.5 text-sm resize-y min-h-[120px]
            bg-[var(--color-bg-surface)]
            border-2 rounded-[var(--radius-md)]
            border-[var(--color-border)]
            text-[var(--color-text)]
            placeholder:text-[var(--color-text-tertiary)]
            transition-all duration-150
            focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-focus)]
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs text-[var(--color-text-tertiary)]">{hint}</span>
        )}
        {error && (
          <span className="text-xs text-[var(--color-error)]">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
