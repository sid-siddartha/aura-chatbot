"use client";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .loader-container {
          animation: fadeInUp 0.8s ease-out;
        }

        .spinner {
          animation: spin 2s linear infinite;
        }

        .shimmer-text {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      <div className="loader-container text-center">
        {/* Logo/Icon Circle */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>
            
            {/* Spinning ring */}
            <div className="spinner absolute inset-0 border-4 border-transparent border-t-white border-r-slate-400 rounded-full"></div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Loading
            <span className="shimmer-text"> Aura</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">
              Finance Assistant
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mt-8 space-y-2">
          <p className="text-slate-400 text-sm tracking-widest uppercase">
            Initializing your assistant
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-500"
                style={{
                  animation: `shimmer 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-slate-500 text-xs">
          <p>Powered by Aura Finance</p>
        </div>
      </div>
    </div>
  );
}
