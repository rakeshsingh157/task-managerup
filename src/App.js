import React, { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./components/UI/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, 
  useLocation,
} from "react-router-dom";

import Login from "./components/DataBase/login";
import SignUp from "./components/DataBase/register";
import Profile from "./components/DataBase/profile";
import TaskBoard from "./components/Tl/mainpage";
import Collaboration from "./components/Tl/Collaboration";
import Calendar from "./components/Tl/calendar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { auth } from "./components/DataBase/firebase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/profile" /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mainpage" element={<TaskBoard />} />
          <Route path="/Collaboration" element={<Collaboration />} />
          <Route path="/calendar" element={<Calendar />} />
          
        </Routes>
        <Routes>
        </Routes>
      </MainLayout>
      <ToastContainer />
    </Router>
  );
}

function MainLayout({ children }) {
  const location = useLocation();

  let isFullScreen = false; // Default false rakho

  if (["/mainpage", "/collaboration", "/calendar"].includes(location.pathname.toLowerCase())) {
    isFullScreen = true;
  }

  return isFullScreen ? (
    <>{children}</> // No wrapper for full-screen pages
  ) : (
    <div className="auth-wrapper">
      <div className="auth-inner">{children}</div>
    </div>
  );
}


export default App;
