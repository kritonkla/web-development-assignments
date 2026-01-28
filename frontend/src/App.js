import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/TodoList';
import Signup from './components/Signup';
import { FaSun, FaMoon } from 'react-icons/fa';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    
    // New state to toggle between Login and Signup
    const [authView, setAuthView] = useState('login'); // Options: 'login' or 'signup'

    useEffect(() => {
        const storedUser = localStorage.getItem('todo_username');
        if (storedUser) setCurrentUser(storedUser);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogin = (username) => setCurrentUser(username);
    
    const handleLogout = () => {
        localStorage.removeItem('todo_username');
        setCurrentUser(null);
        setAuthView('login'); // Reset to login view on logout
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-10 px-4 font-sans text-gray-900 dark:bg-gray-900 transition-colors duration-300">
            
            <div className="w-full max-w-md bg-white dark:bg-gray-600 rounded-3xl shadow-xl overflow-hidden min-h-[600px] relative flex flex-col transition-colors duration-300">
                <button
                    onClick={toggleTheme}
                    className='absolute top-6 left-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-900  text-gray-500 dark:text-yellow-500
                               hover:bg-gray-200 dark:hover:bg-gray-950 transition-all shadow-sm'
                    aria-label='Toggle Dark Mode'
                    >
                    {darkMode ? <FaSun size={20}/> : <FaMoon size={20}/>}
                </button>

                {/* LOGIC: 
                    1. If currentUser exists -> Show TodoList
                    2. If NO currentUser -> Check authView ('login' vs 'signup') 
                */}
                {currentUser ? (
                    <TodoList username={currentUser} onLogout={handleLogout} />
                ) : (
                    <>
                        {authView === 'login' ? (
                            <Login 
                                onLogin={handleLogin} 
                                // Pass function to switch to Signup
                                onSwitchToSignup={() => setAuthView('signup')} 
                            />
                        ) : (
                            <Signup 
                                onLogin={handleLogin} // Optional: if signup auto-logs them in
                                // Pass function to switch back to Login
                                onSwitchToLogin={() => setAuthView('login')} 
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;