"use client";

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ============================================================================
// Common Types
// ============================================================================

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

// ============================================================================
// FormInput Component
// ============================================================================

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className">, BaseFieldProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              border rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:border-transparent
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-[#00B5A5]"
              }
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

// ============================================================================
// FormSelect Component
// ============================================================================

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">, BaseFieldProps {
  options: SelectOption[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, required, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2
            border rounded-lg
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            focus:ring-2 focus:border-transparent
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-[#00B5A5]"
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

// ============================================================================
// FormTextarea Component
// ============================================================================

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">, BaseFieldProps {
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, resize = "vertical", id, ...props }, ref) => {
    const textareaId = id || props.name;

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2
            border rounded-lg
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:border-transparent
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${resizeClasses[resize]}
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-[#00B5A5]"
            }
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

// ============================================================================
// FormCheckbox Component
// ============================================================================

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">, BaseFieldProps {
  description?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, description, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex items-start">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            h-4 w-4 mt-1
            rounded
            border-gray-300 dark:border-gray-600
            text-[#00B5A5]
            focus:ring-[#00B5A5]
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          {...props}
        />
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

// ============================================================================
// FormFieldGroup Component (for grouping related fields)
// ============================================================================

interface FormFieldGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function FormFieldGroup({
  title,
  description,
  children,
  columns = 1,
}: FormFieldGroupProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`grid gap-4 ${columnClasses[columns]}`}>{children}</div>
    </div>
  );
}
