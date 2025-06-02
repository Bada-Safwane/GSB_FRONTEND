import React from 'react'

function ProfileAvatar({ src, alt, className = '', size = 'md', ...props }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div 
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 ${className}`}
      {...props}
    >
      <img 
        src={src || '/src/assets/11435235.png'} 
        alt={alt || 'Profile'} 
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default ProfileAvatar