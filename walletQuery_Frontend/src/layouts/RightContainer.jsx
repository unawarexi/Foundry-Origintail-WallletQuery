// RightContainer.jsx
import React from "react";
import useResponsive from "../core/hooks/useResponsive";

const RightContainer = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div
      className={`
      w-full min-h-screen flex flex-col
      ${
        isMobile
          ? "p-4 pt-20" // Small padding for mobile
          : isTablet
          ? "p-6 pt-28" // Medium padding for tablet
          : "p-8 pt-28" // Large padding for desktop
      }
      bg-slate-950
    `}
    >
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto " >{children}</div>
      </div>
    </div>
  );
};

export default RightContainer;
