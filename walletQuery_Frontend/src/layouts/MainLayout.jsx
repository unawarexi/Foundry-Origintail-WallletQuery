import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import LeftContainer from "./LeftContainer";
import RightContainer from "./RightContainer";
import useResponsive from "../core/hooks/useResponsive";

const MainLayout = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <LeftContainer />

      <div
        className={`
        transition-all duration-300 min-h-screen
        ${isMobile ? "ml-0" : ""}
      `}
      >
        <NavBar />

        <div className="">
          <RightContainer>
            <Outlet />
          </RightContainer>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
