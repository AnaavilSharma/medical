// src/LoginPage.js
import React, { useState, useContext } from 'react';
// Import AppContext from App.js. This allows LoginPage to access the global state.
import { AppContext } from './App';
import { ThemeContext } from './App'; 

const LoginPage = () => {
    // Destructure setCurrentUser and setCurrentPage from AppContext
    // These functions are passed down from the main App component via the context provider.
    const { setCurrentUser, setCurrentPage } = useContext(AppContext);
    
    // Get dark mode context
    const { isDarkMode } = useContext(ThemeContext);

    // State variables to hold form input values
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); // Default empty for dropdown
    // State variable for displaying login messages (feedback to the user)
    const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default browser form submission (page reload)

        // Clear previous messages
        setLoginMessage({ text: '', type: '' });

        // Basic client-side validation
        if (!username || !password || !role) {
            setLoginMessage({ text: 'Please fill in all fields.', type: 'error' });
            return;
        }

        // --- FIX: Changed backendUrl to a generic users login endpoint ---
        const backendUrl = `http://127.0.0.1:8000/api/users/login/`; 

        // Prepare the data payload to send to the backend API
        const payload = {
            username: username,
            password: password,
            role: role // --- FIX: Include role in the payload
        };

        // Display a loading message to the user
        setLoginMessage({ text: 'Logging in...', type: 'info' });

        try {
            // Make the POST request to your backend API
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Specify content type as JSON
                },
                body: JSON.stringify(payload) // Convert JavaScript object to JSON string
            });

            // Check if the HTTP response was successful (status code 2xx)
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response from the backend
                
                // Construct the user object from the backend response.
                // It's crucial to normalize the role to lowercase here
                // to match the 'case' statements in App.js for dashboard rendering.
                const loggedInUser = {
                    id: data.id, // Assuming your backend returns an 'id' for the user
                    username: data.username,
                    role: data.role.toLowerCase(), // Convert role to lowercase
                    token: data.token // Assuming your backend returns an 'authentication token'
                };

                // Update the global state in AppContext
                setCurrentUser(loggedInUser); // Set the logged-in user details
                setCurrentPage('dashboard');   // Navigate to the dashboard page

                // Display success message (this will be brief before navigation)
                setLoginMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                console.log('Login successful:', loggedInUser);

            } else {
                // Handle HTTP errors (e.g., 401 Unauthorized, 404 Not Found, 400 Bad Request)
                const errorData = await response.json(); // Attempt to parse error message from backend
                setLoginMessage({ text: `Login failed: ${errorData.message || 'Invalid credentials.'}`, type: 'error' });
                console.error('Login failed:', response.status, errorData);
            }
        } catch (error) {
            // Handle network errors or other unexpected issues (e.g., backend not running)
            setLoginMessage({ text: 'An error occurred during login. Please ensure the backend is running and accessible.', type: 'error' });
            console.error('Fetch error:', error);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`p-8 rounded-xl shadow-2xl max-w-sm w-full text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* MAMC Logo/Image */}
                <img
                    src="/_api/content/uploaded:image_f6886c.png-61901599-c37e-4375-b24b-85b653820377"
                    alt="Maharaja Agrasen Medical College Logo"
                    className="mamc-logo mx-auto mb-6 rounded-lg w-full h-auto" // Added w-full h-auto for responsiveness
                    onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite loop if placeholder also fails
                        e.currentTarget.src = 'https://placehold.co/400x100/A0A0A0/FFFFFF?text=MAMC+Logo';
                    }}
                />

                <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-8`}>MAMC Portal</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
                    {/* Username Input */}
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                            isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        required
                    />

                    {/* Password Input */}
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                            isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        required
                    />

                    {/* Role Selection Dropdown */}
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-lg appearance-none cursor-pointer focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                            isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        required
                    >
                        <option value="" disabled className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Your Role</option>
                        <option value="admin" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Admin</option>
                        <option value="student" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Student</option>
                        <option value="parent" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Parent</option>
                        <option value="teacher" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Teacher</option>
                        <option value="principal" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Principal</option>
                    </select>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 text-lg"
                    >
                        Login
                    </button>
                </form>

                {/* Message Area for Login Status */}
                {loginMessage.text && (
                    <div
                        className={`mt-6 p-4 rounded-lg text-left ${
                            loginMessage.type === 'success' ? (isDarkMode ? 'bg-green-900 text-green-200 border border-green-600' : 'bg-green-100 text-green-800 border border-green-300') :
                            loginMessage.type === 'error'   ? (isDarkMode ? 'bg-red-900 text-red-200 border border-red-600' : 'bg-red-100 text-red-800 border border-red-300') :
                                                              (isDarkMode ? 'bg-blue-900 text-blue-200 border border-blue-600' : 'bg-blue-100 text-blue-800 border border-blue-300')
                        }`}
                    >
                        {loginMessage.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
