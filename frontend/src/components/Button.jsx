const variants = {
  primary: 'bg-primary hover:bg-primary-dark',
  secondary: 'bg-secondary hover:bg-secondary-dark',
  danger: 'bg-red-600 hover:bg-red-700',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg
        font-semibold
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button 