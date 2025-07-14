interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean; 
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ children, loading, className, ...props }) => {
  return (
    <button
      type="submit"
      className={`px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${className || ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};