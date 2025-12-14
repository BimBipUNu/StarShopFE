function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/80 z-50">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingScreen;
