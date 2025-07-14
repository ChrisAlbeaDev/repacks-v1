interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost'; // Define common button styles
  size?: 'sm' | 'md' | 'lg'; // Define common button sizes
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseStyles = 'rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  let variantStyles = '';
  let sizeStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500';
      break;
    case 'danger':
      variantStyles = 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500';
      break;
    case 'warning':
      variantStyles = 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-gray-700 hover:bg-gray-200 focus:ring-gray-300';
      break;
    default:
      variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  }

  switch (size) {
    case 'sm':
      sizeStyles = 'p-1 text-sm';
      break;
    case 'md':
      sizeStyles = 'p-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-4 py-2 text-lg';
      break;
    default:
      sizeStyles = 'p-2 text-base';
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};