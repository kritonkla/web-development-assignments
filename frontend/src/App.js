import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/TodoList';

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('todo_username');
        if (storedUser) setCurrentUser(storedUser);
    }, []);

    const handleLogin = (username) => setCurrentUser(username);
    
    const handleLogout = () => {
        localStorage.removeItem('todo_username');
        setCurrentUser(null);
    };

    return (
        // 1. min-h-screen: Ensures background covers the whole screen height
        // 2. flex items-center justify-center: Centers the card on Desktop
        // 3. py-10 px-4: Adds breathing room around the card
        <div className="min-h-screen flex items-center justify-center py-10 px-4 font-sans text-gray-900">
            
            {/* THE CARD CONTAINER */}
            {/* w-full: Full width on mobile */}
            {/* max-w-md: Stops growing at 'medium' width (approx tablet size) */}
            {/* bg-white rounded-3xl shadow-xl: Creates the "Card" look */}
            {/* overflow-hidden: Ensures content doesn't spill out of rounded corners */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] relative flex flex-col">
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