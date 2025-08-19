import React from "react";
import useResponsive from "../core/hooks/useResponsive";

const RightContainer = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div
      className={`
      transition-all duration-300
      ${isMobile ? "p-4" : isTablet ? "p-6" : "p-28"}
      bg-slate-950
    `}
    >
      <div className="w-[90%]  mx-auto">{children}</div>
    </div>
  );
};

export default RightContainer;
