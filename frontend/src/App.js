import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { Routes, Route, Navigate  } from "react-router-dom";
import TodoList from "./components/TodoList";
import TeamDetail from "./components/TeamDetail";
import { FaSun, FaMoon } from "react-icons/fa";
import TeamList from "./components/TeamList";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("todo_username");
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = (username) => setCurrentUser(username);

  const handleLogout = () => {
    localStorage.removeItem("todo_username");
    setCurrentUser(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

 return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 font-sans text-gray-900 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-600 rounded-3xl shadow-xl overflow-hidden min-h-[600px] relative flex flex-col">

        {/* Toggle theme */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-6 left-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-yellow-500"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={
              currentUser
                ? <Navigate to="/" />
                : <Login onLogin={handleLogin} />
            }
          />

          {/* Team list */}
          <Route
            path="/"
            element={
              currentUser
                ? <TeamList username={currentUser} onLogout={handleLogout} />
                : <Navigate to="/login" />
            }
          />

          {/* Team detail */}
          <Route
            path="/teams/:teamId"
            element={
              currentUser
                ? <TeamDetail />
                : <Navigate to="/login" />
            }
          />
        </Routes>

      </div>
    </div>
  );
}
export default App;
