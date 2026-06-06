const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-semibold ring-2 ring-white shadow-md ${className}`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
