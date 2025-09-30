import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css';
import App from './App.jsx'
import Register from './common/Register.jsx';
import WardenRegister from "./common/WardenRegister.jsx"
import ComplaintForm from './common/ComplaintForm.jsx'
import Header from './common/Header.jsx'
import Footer from './common/Footer.jsx'
import Home from './common/Home.jsx'
import About from './common/About.jsx'
import Signup from './common/Signup.jsx'
import Signout from './common/Signout.jsx'
import StudentProfile from "./common/StudentProfile.jsx"
import WardenProfile from './common/WardenProfile.jsx';
import VerifyComplaints from './common/VerifyComplaints.jsx';
import NotificationSystem from './common/NotificationSystem.jsx';
import NavigationTest from './common/NavigationTest.jsx';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import RootLayout from './components/RootLayout.jsx'
import { UserProvider } from '../src/context/UserContext.jsx'

const browserRouterObj = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "debug",
        element: <NavigationTest />
      },
      {
        path: "signup",
        element: <Signup />,
        children: [
          {
            path: "register",
            element: <Register />
          },
          {
            path: "warden-register",
            element: <WardenRegister />
          }
        ]
      },
      {
        path: "signout",
        element: <Signout />
      },
      // Student routes
      {
        path: "student-profile/:studentId",
        element: <StudentProfile />
      },
      {
        path: "student-profile/:studentId/complaint-form",
        element: <ComplaintForm />
      },
      {
        path: "student-profile/:studentId/notifications",
        element: <NotificationSystem />
      },
      // Warden routes
      {
        path: "warden-profile/:wardenId",
        element: <WardenProfile />
      },
      {
        path: "warden-profile/:wardenId/verify-complaints",
        element: <VerifyComplaints />
      },
      {
        path: "warden-profile/:wardenId/notifications",
        element: <NotificationSystem />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider
        router={browserRouterObj}
        future={{
          v7_relativeSplatPath: true,
        }}
      />
    </UserProvider>
  </StrictMode>,
)