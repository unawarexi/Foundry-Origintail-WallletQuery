import React from 'react'
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import LeftContainer from './LeftContainer'
import RightContainer from './RightContainer'
import Dashboard from '../pages/Dashboard'

const MainLayout = () => {
    
    return (
      <div>
        <NavBar />
        <LeftContainer />

            <RightContainer>
                <Dashboard />
                </RightContainer>
      </div>
    );
}

export default MainLayout
