const Input = ({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full
          px-4
          py-2
          bg-background
          rounded-lg
          border
          ${error ? 'border-red-500' : 'border-gray-600'}
          focus:ring-2
          focus:ring-primary
          focus:border-transparent
          outline-none
          text-white
          placeholder-gray-400
          transition-colors
          duration-200
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input 