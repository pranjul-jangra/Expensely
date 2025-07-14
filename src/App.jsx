import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { useState, lazy, useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from 'react-redux';
import './App.css'
import useLenis from './hooks/useLenis';

const Dashboard = lazy(() => import('./layout/Dashboard'));
const Signup = lazy(() => import('./layout/Signup'));
const UpsertTransaction = lazy(() => import('./layout/UpsertTransaction'));
const Settings = lazy(() => import('./layout/Settings'));
const Theme = lazy(() => import('./components/settingsComponents/Theme'));
const AccountAndPrivacy = lazy(() => import('./components/settingsComponents/AccountAndPrivacy'));
const ManageTransaction = lazy(() => import('./components/settingsComponents/ManageTransaction'));
const Savings = lazy(() => import('./components/settingsComponents/Savings'));
const Profile = lazy(() => import('./components/settingsComponents/Profile'));
const NotFound = lazy(() => import('./layout/NotFound'));
const LandingPage = lazy(() => import('./layout/LandingPage'));
const Loader = lazy(() => import('./components/Loader'));
const RateLimiter = lazy(() => import('./components/RateLimiter'));
const UnauthorizedPage = lazy(() => import('./components/UnauthorizedPage'));
const PasswordAndEmailUpdation = lazy(() => import('./components/PasswordAndEmailUpdation'));


// Wrapper component for all routes
function RootLayout({ isLightTheme }) {
  const location = useLocation();
  const loader = useSelector((state) => state.user.loader);
  const isAuthorized = useSelector((state) => state.user.isAuthorized);
  const rateLimitExceeds = useSelector((state) => state.user.rateLimitExceeds);

  // Smooth scrolling
  useLenis();

  // Stop body scrolling
  useEffect(() => {
    if (loader || !isAuthorized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [loader, isAuthorized]);

  // Routes on those the UnauthorizedPage should be hidden
  const publicRoutes = ['/', '/signup'];
  const shouldShowUnauthorized = !isAuthorized && !loader && !publicRoutes.includes(location.pathname);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
      
      {shouldShowUnauthorized && <UnauthorizedPage />}
      {loader && <Loader />}

      {/* Rate limiter indicator (total requests exceeds) */}
      {rateLimitExceeds && <RateLimiter isLightTheme={isLightTheme} />}

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover draggable limit={3} />
    </>
  );
}


// Router with all routes
const createRouter = (isLightTheme, toggleTheme) => createBrowserRouter([
  {
    path: "/",
    element: <RootLayout isLightTheme={isLightTheme} toggleTheme={toggleTheme} />,
    children: [
      {
        path: "",
        element: <LandingPage isLightTheme={isLightTheme} />
      },
      {
        path: "dashboard",
        element: <Dashboard isLightTheme={isLightTheme} />
      },
      {
        path: "signup",
        element: <Signup isLightTheme={isLightTheme} />
      },
      {
        path: "home/add-transaction",
        element: <UpsertTransaction isLightTheme={isLightTheme} />
      },
      {
        path: "home/edit-transaction/:id",
        element: <UpsertTransaction isLightTheme={isLightTheme} />
      },
      {
        path: "settings",
        element: <Settings isLightTheme={isLightTheme} />
      },
      {
        path: "settings/theme",
        element: <Theme isLightTheme={isLightTheme} toggleTheme={toggleTheme} />
      },
      {
        path: "settings/account",
        element: <AccountAndPrivacy isLightTheme={isLightTheme} />
      },
      {
        path: "settings/manage-transaction",
        element: <ManageTransaction isLightTheme={isLightTheme} />
      },
      {
        path: "settings/savings",
        element: <Savings isLightTheme={isLightTheme} />
      },
      {
        path: "settings/profile",
        element: <Profile isLightTheme={isLightTheme} />
      },
      {
        path: "reset-password",
        element: <PasswordAndEmailUpdation isLightTheme={isLightTheme} />
      },
      {
        path: "update-email",
        element: <PasswordAndEmailUpdation isLightTheme={isLightTheme} />
      },
      {
        path: "*",
        element: <NotFound isLightTheme={isLightTheme} />
      }
    ]
  }
]);


export default function App() {
  const [isLightTheme, setIsLightTheme] = useState(JSON.parse(localStorage.getItem("expenselyTheme") || "true"));

  // Change theme
  function toggleTheme(isLight) {
    localStorage.setItem("expenselyTheme", JSON.stringify(isLight));
    setIsLightTheme(isLight);
  }

  const router = createRouter(isLightTheme, toggleTheme);

  return <RouterProvider router={router} />
}