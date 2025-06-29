interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ id, label, children, className, ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-slate-800 text-sm font-semibold mb-2">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className ?? ''}`}
    />
    {children}
  </div>
);
