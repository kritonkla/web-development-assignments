import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const CEI_LOGO_URL = "https://cei.kmitl.ac.th/wp-content/uploads/2024/09/cropped-ceip-fav-1.png"; 

const API_URL = process.env.REACT_APP_API_URL;
const SITE_KEY = process.env.REACT_APP_SITE_KEY;

function Signup({ onLogin, onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const [avatar, setAvatar] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim()) {
            setError('Please enter a username.');
            return;
        }
        if (!email.trim()) {
            setError('Please enter an email.');
            return;
        }
        if (!password.trim()) {
            setError('Please enter a password.');
            return;
        }
        if (!captchaToken) {
            setError('Please verify that you are not a robot.');
            return;
        }


        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                if (avatar) {
                    await handleImageUpload(username);
                }
                localStorage.setItem('todo_username', username);
                onLogin(username);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Network error: Could not connect to server.');
        }
    };

    const handleImageUpload = async (username) => {
        const formData = new FormData();
        formData.append('avatar', avatar);   // The file
        formData.append('username', username); // Tell backend who this is for

        try {
            await fetch(`${API_URL}/upload-avatar`, {
                method: 'POST',
                body: formData, // No headers needed, browser handles it
            });
        } catch (err) {
            console.error("Image upload failed, but account was created.");
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
                    placeholder="Enter your email"
                    className="w-full p-4 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter your password"
                    className="w-full p-4 bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                <div className='flex justify-center'>
                    <ReCAPTCHA
                        sitekey={SITE_KEY}
                        onChange={(token => setCaptchaToken(token))}
                    />
                </div>
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
            <a 
                href="http://localhost:5001/auth/google"
                className="w-full mt-5 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 p-4 rounded-2xl font-bold hover:bg-gray-50 transition"
            >
                {/* Simple Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
            </a>
        <div className="mt-4 text-center">
        <p className="text-gray-500">Already have an account?</p>
        <button 
          type='button'
          onClick={onSwitchToLogin} 
          className="text-blue-500 hover:underline font-semibold"
        >
          Log In
        </button>
      </div>
            
            {error && (
                <div className="mt-6 p-3 bg-red-50 text-red-500 rounded-xl text-center text-sm font-medium">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Signup;