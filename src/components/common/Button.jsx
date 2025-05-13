import React from 'react'

function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = false,
  disabled = false,
  ...props 
}) {
  // Button variants
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 border border-gray-300',
    success: 'bg-success-500 hover:opacity-90 active:opacity-100 text-white',
    danger: 'bg-error-500 hover:opacity-90 active:opacity-100 text-white',
    text: 'bg-transparent hover:bg-gray-100 text-gray-700',
  }

  const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses = variants[variant]
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button