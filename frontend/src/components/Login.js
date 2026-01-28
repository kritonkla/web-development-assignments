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
