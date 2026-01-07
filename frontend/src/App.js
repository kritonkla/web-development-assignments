import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/TodoList';
import { FaSun,FaMoon } from 'react-icons/fa';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

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
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        // 1. min-h-screen: Ensures background covers the whole screen height
        // 2. flex items-center justify-center: Centers the card on Desktop
        // 3. py-10 px-4: Adds breathing room around the card
        <div className="min-h-screen flex items-center justify-center py-10 px-4 font-sans text-gray-900 dark:bg-gray-900 transition-colors duration-300">
            
            {/* THE CARD CONTAINER */}
            {/* w-full: Full width on mobile */}
            {/* max-w-md: Stops growing at 'medium' width (approx tablet size) */}
            {/* bg-white rounded-3xl shadow-xl: Creates the "Card" look */}
            {/* overflow-hidden: Ensures content doesn't spill out of rounded corners */}
            <div className="w-full max-w-md bg-white dark:bg-gray-600 rounded-3xl shadow-xl overflow-hidden min-h-[600px] relative flex flex-col transition-colors duration-300">
                <button
                    onClick={toggleTheme}
                    className='absolute top-6 left-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-900  text-gray-500 dark:text-yellow-500
                                 hover:bg-gray-200 dark:hover:bg-gray-950 transition-all shadow-sm'
                    aria-label='Toggle Dark Mode'
                    >
                        {darkMode ? <FaSun size={20}/> : <FaMoon size={20}/>}
                    </button>
                {currentUser ? (
                    <TodoList username={currentUser} onLogout={handleLogout} />
                ) : (
                    <Login onLogin={handleLogin} />
                )}
            </div>
        </div>
    );
}

export default App;