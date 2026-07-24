type InputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: "text" | "url";
  required?: boolean;
};

export function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  required = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && (
          <span className="text-critical ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-lg border bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
          error ? "border-critical" : "border-zinc-700 hover:border-zinc-500"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
