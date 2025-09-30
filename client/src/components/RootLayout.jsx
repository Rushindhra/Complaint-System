import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../common/Footer'
import Header  from '../common/Header'
function RootLayout() {
  return (
    <div>
        <Header /> 
        <div style={{minHeight:"90vh"}}>
            <Outlet />
        </div>
        <Footer /> 
    </div>
  )
}

export default RootLayout