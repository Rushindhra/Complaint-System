import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../common/Footer'

function RootLayout() {
  return (
    <div>
        <div style={{minHeight:"90vh"}}>
            <Outlet />
        </div>
        <Footer /> 
    </div>
  )
}

export default RootLayout