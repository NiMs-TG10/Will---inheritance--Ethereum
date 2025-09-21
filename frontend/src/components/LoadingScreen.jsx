const LoadingScreen = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-primary">Loading...</h2>
        <p className="text-gray-400 mt-2">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
