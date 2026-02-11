import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/TodoList';
import Signup from './components/Signup';
import TeamDashboard from './components/teamDashboard';
import { FaSun, FaMoon, FaUsers, FaUser, FaSignOutAlt } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
    // currentUser will now store the FULL object: { id, username, email, ... }
    const [currentUser, setCurrentUser] = useState(null); 
    const [darkMode, setDarkMode] = useState(false);
    const [authView, setAuthView] = useState('login');
    
    // --- Team State ---
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'teams'
    const [myTeams, setMyTeams] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null); 
    const [newTeamName, setNewTeamName] = useState('');

    // 1. Check Local Storage & Handle Google Redirect on Load
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const googleUser = queryParams.get('username');

        if (googleUser) {
            // Case A: Coming from Google Login
            const decodedUser = decodeURIComponent(googleUser);
            localStorage.setItem('todo_username', decodedUser);
            window.history.replaceState({}, document.title, "/");
            // Fetch the full ID for this username
            fetchUserDetails(decodedUser);
        } else {
            // Case B: Normal Page Load
            const storedUser = localStorage.getItem('todo_username');
            if (storedUser) {
                // We have the username, now we need the ID for Teams to work
                fetchUserDetails(storedUser);
            }
        }
    }, []);

    // Helper: We need the User ID for teams, but local storage only has username.
    // This fetches the ID based on the name.
    const fetchUserDetails = async (username) => {
        try {
             const res = await fetch(`${API_URL}/get-users`); 
             const users = await res.json();
             const found = users.find(u => u.username === username);
             if (found) {
                 setCurrentUser(found); // Sets { id, username, ... }
             }
        } catch(e) { console.error("Could not fetch user details", e); }
    };

    // 2. Dark Mode Logic
    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    // 3. Login/Logout Handlers
    const handleLogin = (user) => {
        if (typeof user === 'object') {
            setCurrentUser(user);
            localStorage.setItem('todo_username', user.username);
        } else {
            localStorage.setItem('todo_username', user);
            fetchUserDetails(user);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('todo_username');
        setCurrentUser(null);
        setAuthView('login');
        setViewMode('personal');
        setActiveTeam(null);
    };

    // 4. Team API Calls
    const fetchMyTeams = async () => {
        if (!currentUser || !currentUser.id) return;
        try {
            const res = await fetch(`${API_URL}/get-team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: currentUser.id }) 
            });
            const data = await res.json();
            setMyTeams(data);
        } catch (err) { console.error(err); }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName || !currentUser.id) return;
        try {
            const res = await fetch(`${API_URL}/team/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: currentUser.id, team_name: newTeamName })
            });
            if (res.ok) {
                setNewTeamName('');
                fetchMyTeams();
            }
        } catch (err) { console.error(err); }
    };

    // Fetch teams whenever we switch to "Teams" tab
    useEffect(() => {
        if (currentUser && viewMode === 'teams') {
            fetchMyTeams();
        }
        // eslint-disable-next-line
    }, [viewMode, currentUser]);


    return (
        <div className="min-h-screen flex items-center justify-center py-10 px-4 font-sans text-gray-900 dark:bg-gray-900 transition-colors duration-300">
            
            <div className="w-full max-w-5xl bg-white dark:bg-gray-700 rounded-3xl shadow-xl overflow-hidden min-h-[700px] relative flex flex-col transition-colors duration-300">
                
                {/* Dark Mode Toggle (Absolute Top-Left) */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className='absolute top-6 left-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-yellow-500 hover:bg-gray-200 transition-all shadow-sm'
                >
                    {darkMode ? <FaSun size={20}/> : <FaMoon size={20}/>}
                </button>

                {currentUser ? (
                    <div className="flex h-full flex-grow">
                        
                        {/* --- SIDEBAR NAVIGATION --- */}
                        <div className="w-24 bg-gray-50 dark:bg-gray-800 flex flex-col items-center py-20 gap-8 border-r border-gray-100 dark:border-gray-600 z-10">
                            
                            <button 
                                onClick={() => { setViewMode('personal'); setActiveTeam(null); }}
                                className={`p-4 rounded-2xl transition-all shadow-sm ${
                                    viewMode === 'personal' 
                                    ? 'bg-blue-600 text-white shadow-blue-200' 
                                    : 'bg-white dark:bg-gray-700 text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                                }`}
                                title="Personal Tasks"
                            >
                                <FaUser size={20} />
                            </button>

                            <button 
                                onClick={() => setViewMode('teams')}
                                className={`p-4 rounded-2xl transition-all shadow-sm ${
                                    viewMode === 'teams' 
                                    ? 'bg-blue-600 text-white shadow-blue-200' 
                                    : 'bg-white dark:bg-gray-700 text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                                }`}
                                title="Team Dashboard"
                            >
                                <FaUsers size={20} />
                            </button>

                            <div className="mt-auto mb-4">
                                <button
                                    onClick={handleLogout}
                                    className="p-4 rounded-2xl bg-white dark:bg-gray-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                                    title="Logout"
                                >
                                    <FaSignOutAlt size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* --- MAIN CONTENT AREA --- */}
                        <div className="flex-1 bg-white dark:bg-gray-700 overflow-hidden relative">
                            
                            {/* VIEW: PERSONAL */}
                            {viewMode === 'personal' && (
                                // We pass just the username to keep TodoList happy
                                <TodoList username={currentUser.username} onLogout={handleLogout} />
                            )}

                            {/* VIEW: TEAM SELECTION */}
                            {viewMode === 'teams' && !activeTeam && (
                                <div className="p-10 h-full overflow-y-auto">
                                    <h2 className="text-3xl font-bold dark:text-white mb-2">My Teams</h2>
                                    <p className="text-gray-400 mb-8">Collaborate with your squad</p>
                                    
                                    {/* Create Team Form */}
                                    <form onSubmit={handleCreateTeam} className="flex gap-3 mb-10 max-w-xl">
                                        <input 
                                            type="text" 
                                            placeholder="Enter new team name..." 
                                            className="flex-1 p-4 rounded-2xl border-none bg-gray-50 dark:bg-gray-600 dark:text-white shadow-inner focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newTeamName} 
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                        />
                                        <button className="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                                            Create
                                        </button>
                                    </form>

                                    {/* Team Grid */}
                                    {myTeams.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-600 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-500">
                                            <p className="text-gray-400">You haven't joined any teams yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {myTeams.map(team => (
                                                <div 
                                                    key={team.team_id || team.id} 
                                                    onClick={() => setActiveTeam(team)}
                                                    className="group p-6 bg-white dark:bg-gray-600 rounded-3xl border border-gray-100 dark:border-gray-500 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                                                            <FaUsers className="text-blue-500 text-xl" />
                                                        </div>
                                                        <span className="text-xs font-mono text-gray-300">ID: {team.id}</span>
                                                    </div>
                                                    <h3 className="font-bold text-xl text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                                                        {team.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 mt-2">Click to view board &rarr;</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VIEW: SINGLE TEAM DASHBOARD */}
                            {viewMode === 'teams' && activeTeam && (
                                <TeamDashboard 
                                    user={currentUser} 
                                    team={activeTeam} 
                                    onBack={() => setActiveTeam(null)} 
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    // AUTH VIEWS
                    <div className="flex items-center justify-center h-full">
                         {authView === 'login' ? (
                            <Login 
                                onLogin={handleLogin} 
                                onSwitchToSignup={() => setAuthView('signup')} 
                            />
                        ) : (
                            <Signup 
                                onLogin={handleLogin}
                                onSwitchToLogin={() => setAuthView('login')} 
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;