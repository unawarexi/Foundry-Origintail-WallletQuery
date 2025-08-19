import React, { useState, useEffect } from "react";
import { Construction, ArrowLeft, Wallet, Activity, CreditCard, Settings, Home, AlertCircle } from "lucide-react";

const NotAvailable = ({ screenName = "Feature", isNotFound = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Animate progress bar
    const timer = setTimeout(() => {
      setProgress(65);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get the appropriate icon based on screen name
  const getIcon = () => {
    switch (screenName.toLowerCase()) {
      case "balance":
        return Wallet;
      case "transactions":
        return Activity;
      case "cards":
        return CreditCard;
      case "settings":
        return Settings;
      case "dashboard":
        return Home;
      default:
        return isNotFound ? AlertCircle : Construction;
    }
  };

  const Icon = getIcon();

  return (
    <div className=" rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 py-10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl" />

      <div className={`max-w-md w-full text-center transform transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
        {/* Main Icon Container */}
        <div className="relative mb-8">
          {/* Pulsing background */}
          <div className="absolute inset-0 w-32 h-32 mx-auto animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl" />
          </div>

          {/* Icon container */}
          <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Icon className="text-white" size={48} />

            {/* Status indicator */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">{isNotFound ? <AlertCircle size={18} className="text-white" /> : <Construction size={18} className="text-white" />}</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{isNotFound ? "Page Not Found" : `${screenName} Coming Soon`}</h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-sm mx-auto">{isNotFound ? "The page you're looking for doesn't exist or has been moved." : `The ${screenName.toLowerCase()} feature is currently under development. We're working hard to bring you an amazing experience!`}</p>

        {/* Status Badge */}
        <div className="inline-flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-4 mb-10 hover:bg-slate-700/80 transition-all duration-300">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-slate-300 font-medium">{isNotFound ? "404 Error" : "In Development"}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Back to Dashboard Button */}
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-3 group transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Dashboard</span>
          </button>

          {/* Secondary Actions */}
          {!isNotFound && (
            <div className="flex space-x-4">
              <button className="flex-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:border-slate-500 backdrop-blur-sm" onClick={() => console.log("Notify me clicked")}>
                Notify Me
              </button>

              <button className="flex-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:border-slate-500 backdrop-blur-sm" onClick={() => console.log("Learn more clicked")}>
                Learn More
              </button>
            </div>
          )}
        </div>
       
      </div>
    </div>
  );
};

export default NotAvailable;
