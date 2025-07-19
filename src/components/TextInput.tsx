interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput: React.FC<TextInputProps> = ({ className, ...props }) => {
  return (
    <input
      type="text"
      className={`flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
      {...props}
    />
  );
};