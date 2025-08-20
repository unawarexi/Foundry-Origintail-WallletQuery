import React from "react";
import SideBar from "../components/SideBar";
import useResponsive from "../core/hooks/useResponsive";

const LeftContainer = () => {
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen w-full relative z-30">
      <SideBar />
    </div>
  );
};

export default LeftContainer;
