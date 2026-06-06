const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };

  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-primary-200 border-t-primary-700`} />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-8">{spinner}</div>;
};

export default Loader;
