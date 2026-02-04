import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const CEI_LOGO_URL =
  "https://cei.kmitl.ac.th/wp-content/uploads/2024/09/cropped-ceip-fav-1.png";

const API_URL = process.env.REACT_APP_API_URL;
const SITE_KEY = "6LfKy1gsAAAAAPKnXkuB0jyyqVm0HvvxN-bzs9YN";

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
=======
function Login({ onLogin, onSwitchToSignup }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
>>>>>>> origin/lab6-backend

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!captchaToken) {
      setError('Please verify that you are not a robot.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          captchaToken, // sent to backend (optional for now)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('todo_username', username);
        onLogin(username);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error: Could not connect to server.');
    }
  };

  return (
    <div className="p-8 flex flex-col justify-center h-full">
      <div className="flex justify-center mb-10">
        <img src={CEI_LOGO_URL} alt="CEi Logo" className="h-12 object-contain" />
      </div>

      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2 text-center">
        Welcome
      </h2>
      <p className="text-gray-500 dark:text-gray-200 text-center mb-8">
        Sign in to manage your tasks
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full p-4 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* reCAPTCHA */}
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          />
=======
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                localStorage.setItem('todo_username', username);
                onLogin(username);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Network error: Could not connect to server.');
        }
    };

    return (
        // flex-col justify-center: Centers content vertically
        <div className="p-8 flex flex-col justify-center h-full">
            <div className="flex justify-center mb-10">
               {/* Logo centering */}
               <img src={CEI_LOGO_URL} alt="CEi Logo" className="h-12 object-contain" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2 text-center transition-colors delay-200">Welcome</h2>
            <p className="text-gray-500 dark:text-gray-200 text-center mb-8 transition-colors duration-300">Sign in to manage your tasks</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Input Field Styling */}
                {/* focus:ring-2: Accessibility feature showing which field is active */}
                <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full p-4 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter your password"
                    className="w-full p-4 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* Button Styling */}
                {/* hover:bg-blue-700: Visual feedback for mouse users */}
                {/* active:scale-95: "Click" animation feedback for mobile users */}
                <button 
                    type="submit"
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-2xl font-bold text-lg hover:bg-blue-700 dark:hover:bg-blue-800 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-500/30 dark:shadow-blue-700/30"
                >
                    Get Started
                </button>
            </form>

        <div className="mt-4 text-center">
        <p className="text-gray-500">Don't have an account?</p>
        <button 
          type = "button"
          onClick={onSwitchToSignup} 
          className="text-blue-500 hover:underline font-semibold"
        >
          Sign Up
        </button>
      </div>
            
            {error && (
                <div className="mt-6 p-3 bg-red-50 text-red-500 rounded-xl text-center text-sm font-medium">
                    {error}
                </div>
            )}
>>>>>>> origin/lab6-backend
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          Get Started
        </button>
      </form>

      {error && (
        <div className="mt-6 p-3 bg-red-50 text-red-500 rounded-xl text-center text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}

export default Login;
