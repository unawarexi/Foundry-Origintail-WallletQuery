// MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import LeftContainer from "./LeftContainer";
import RightContainer from "./RightContainer";
import useResponsive from "../core/hooks/useResponsive";

const MainLayout = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Sidebar - 20% */}
      <div className={`${isTablet || isDesktop ? "w-[10%]" : ""}  `}>
        <LeftContainer />
      </div>

      {/* Right Content Area - 80% */}
      <div className=" w-[100%] min-h-screen">
        <NavBar />
        <RightContainer>
          <Outlet />
        </RightContainer>
      </div>
    </div>
  );
};

export default MainLayout;
