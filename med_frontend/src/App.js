import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
//useState: store a component and update data and automatically rerender when the data changes
//createContext: share data across multiple comps without passing props manually at every level
//useContext: calling back createcontext
//useCallback: returns a cached version of a func so that react does not recreate the func on every render
//useEffect: lets you run the code after component renders(fetch data from API etec etc)
// Theme Context for dark/light mode
export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode for better visibility (rerender)
    
    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };
    
    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Theme Toggle Component
const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center space-x-3">
                {/* Sun Icon */}
                <svg className={`w-5 h-5 transition-colors duration-300 ${ //svg: type of image made using htmls tags
                    isDarkMode ? 'text-gray-400' : 'text-yellow-500'
                }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                
                {/* Toggle Switch */}
                <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isDarkMode 
                            ? 'bg-blue-600' 
                            : 'bg-gray-200'
                    }`}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
                
                {/* Moon Icon */}
                <svg className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-gray-400'
                }`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </div>
        </div>
    );
};

// AppContext for global state management (currentUser, currentPage)
export const AppContext = createContext(null);

// Bulletin Board State (top-level, above App)
const BulletinBoardContext = React.createContext();

const BulletinBoardProvider = ({ children }) => {
    const [bulletins, setBulletins] = useState([]);
    const addBulletin = (item) => setBulletins((prev) => [{...item, id: Date.now()}, ...prev]);
    return (
        <BulletinBoardContext.Provider value={{ bulletins, addBulletin }}>
            {children}
        </BulletinBoardContext.Provider>
    );
};

const BulletinBoard = () => {
    const { bulletins } = useContext(BulletinBoardContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <div className={`w-full border-l-4 border-yellow-400 p-6 rounded-lg shadow mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Bulletin Board</h2>
            {bulletins.length === 0 ? (
                <p className="text-yellow-300 italic">No new updates</p>
            ) : (
                <div className="space-y-4">
                    {bulletins.map((bulletin) => (
                        <div key={bulletin.id} className={`p-4 rounded-lg shadow-sm border-l-4 border-yellow-500 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-white'
                        }`}>
                            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bulletin.title}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{bulletin.content}</p>
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(bulletin.id).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminPrincipalBulletinManager = () => {
    const { addBulletin } = useContext(BulletinBoardContext);
    const { currentUser, setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    if (!currentUser || (currentUser.role !== "principal" && currentUser.role !== "admin")) {
        return <div className={`text-center py-10 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Unauthorized. Only admin or principal can add bulletins.</div>;
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setMessage("Title and content are required.");
            return;
        }
        addBulletin({
            title,
            content,
            author: currentUser.username,
            date: new Date().toISOString(),
        });
        setTitle("");
        setContent("");
        setMessage("Bulletin added!");
    };
    return (
        <div className={`max-w-xl mx-auto p-6 rounded-lg shadow-md mt-8 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Add Bulletin Board Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className={`w-full border rounded px-4 py-2 ${
                        isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                    }`} 
                    required 
                />
                <textarea 
                    placeholder="Content" 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    className={`w-full border rounded px-4 py-2 ${
                        isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                    }`} 
                    rows={4} 
                    required 
                />
                <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded">Add Bulletin</button>
                {message && <div className="text-green-400">{message}</div>}
            </form>
            <button className="mt-4 text-blue-400 underline" onClick={() => setCurrentPage('dashboard')}>Back to Dashboard</button>
        </div>
    );
};

// Reusable Section Title Component
const SectionTitle = ({ children }) => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{children}</h3>
    );
};

// Reusable Feature Card Component for Dashboards
const FeatureCard = ({ title, onClick }) => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer border ${
                isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            }`}
        >
            <span className="text-4xl mb-2 text-blue-400">{title[0]}</span> {/* Displays first letter of title as a large icon */}
            <p className={`text-lg font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{title}</p>
        </button>
    );
};

// Layout for all Dashboard pages, including Header and Navigation
const DashboardLayout = ({ children, title }) => {
    const { currentUser, setCurrentUser, setCurrentPage, currentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);

    // Handles user logout, clearing current user and returning to login page
    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('access_token');
        setCurrentUser(null);
        setCurrentPage('login');
    };

    // Only show BulletinBoard on dashboard
    const showBulletin = currentPage === 'dashboard';
    const isAdminOrPrincipal = currentUser && (currentUser.role === 'admin' || currentUser.role === 'principal');

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Header */}
            <header className={`shadow-sm border-b transition-colors duration-300 ${
                isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className={`text-2xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{title}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Welcome, {currentUser?.username} ({currentUser?.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showBulletin ? (
                    // Two-column layout for dashboard
                    <div className="flex gap-8">
                        {/* Left column - Bulletin Board (1/4 width) */}
                        <div className="w-1/4">
                            <BulletinBoard />
                            {isAdminOrPrincipal && <AdminPrincipalBulletinManager />}
                        </div>
                        {/* Right column - Dashboard content (3/4 width) */}
                        <div className="w-3/4">
                            {children}
                        </div>
                    </div>
                ) : (
                    // Single column layout for feature pages
                    <div>
                        {children}
                    </div>
                )}
            </main>
        </div>
    );
};

// --- Dashboard Components (Role-specific) ---
const StudentDashboard = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <DashboardLayout title="Student Dashboard">
            <h2 className={`text-2xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Student Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('attendance')} />
                <FeatureCard title="Grades" onClick={() => setCurrentPage('grades')} />
                <FeatureCard title="Leaves" onClick={() => setCurrentPage('leaves')} />
                <FeatureCard title="Library" onClick={() => setCurrentPage('library')} />
                <FeatureCard title="Payments" onClick={() => setCurrentPage('payments')} />
                <FeatureCard title="Timetable" onClick={() => setCurrentPage('timetable')} />
                <FeatureCard title="My Info Corner" onClick={() => setCurrentPage('myinfo')} />
            </div>
        </DashboardLayout>
    );
};

const ParentDashboard = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <DashboardLayout title="Parent Dashboard">
            <h2 className={`text-2xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Parent Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('attendance')} />
                <FeatureCard title="Grades" onClick={() => setCurrentPage('grades')} />
                <FeatureCard title="Leaves" onClick={() => setCurrentPage('leaves')} />
                <FeatureCard title="Library" onClick={() => setCurrentPage('library')} />
                <FeatureCard title="Payments" onClick={() => setCurrentPage('payments')} />
                <FeatureCard title="Timetable" onClick={() => setCurrentPage('timetable')} />
                <FeatureCard title="My Info Corner" onClick={() => setCurrentPage('myinfo')} />
            </div>
        </DashboardLayout>
    );
};

const TeacherDashboard = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <DashboardLayout title="Teacher Dashboard">
            <h2 className={`text-2xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Teacher Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('teacher-attendance-selection')} />
                <FeatureCard title="Grades" onClick={() => setCurrentPage('grades')} />
                <FeatureCard title="Leaves" onClick={() => setCurrentPage('leaves')} />
                <FeatureCard title="Library" onClick={() => setCurrentPage('library')} />
                <FeatureCard title="Timetable" onClick={() => setCurrentPage('timetable')} />
                <FeatureCard title="My Info Corner" onClick={() => setCurrentPage('myinfo')} />
            </div>
        </DashboardLayout>
    );
};

const AdminDashboard = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <DashboardLayout title="Admin/Principal Dashboard">
            <h2 className={`text-2xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Admin/Principal Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('attendance')} />
                <FeatureCard title="College In/Out Log" onClick={() => setCurrentPage('college-in-out-log')} />
                <FeatureCard title="Grades" onClick={() => setCurrentPage('grades')} />
                <FeatureCard title="Hostel Attendance" onClick={() => setCurrentPage('hostel-attendance')} />
                <FeatureCard title="Leaves" onClick={() => setCurrentPage('leaves')} />
                <FeatureCard title="Library" onClick={() => setCurrentPage('library')} />
                <FeatureCard title="Library Management" onClick={() => setCurrentPage('library-management')} />
                <FeatureCard title="Payments" onClick={() => setCurrentPage('payments')} />
                <FeatureCard title="Timetable" onClick={() => setCurrentPage('timetable')} />
                <FeatureCard title="Students & Faculty Info" onClick={() => setCurrentPage('students-faculty-info')} />
                <FeatureCard title="My Info Corner" onClick={() => setCurrentPage('myinfo')} />
                <FeatureCard title="Create User" onClick={() => setCurrentPage('create-user')} />
            </div>
        </DashboardLayout>
    );
};

// --- Page Components (Feature-specific) ---

// My Info Corner Page
const MyInfoCornerPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetches user information from backend
    React.useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true);
            setError('');
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for My Info Corner.');
                setLoading(false);
                console.log('MyInfoCornerPage: currentUser or token missing.', currentUser);
                return;
            }
            console.log('MyInfoCornerPage: Fetching user info for ID:', currentUser.id, 'with token:', currentUser.token);

            try {
                const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch user info');
                }
                const data = await response.json();
                setUserInfo(data);
                setLoading(false);
                console.log('MyInfoCornerPage: User info fetched successfully.', data);
            } catch (err) {
                setError(`Failed to load user information: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (MyInfoCorner):', err);
            }
        };
        fetchUserInfo();
    }, [currentUser]); // Re-fetch if currentUser changes

    if (loading) return <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading your information...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>My Info Corner</SectionTitle>
            {userInfo ? (
                <div className={`p-6 rounded-lg shadow-md max-w-lg mx-auto ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Username:</strong> {userInfo.username}</p>
                    <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Role:</strong> {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}</p>
                    <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Full Name:</strong> {userInfo.full_name || 'N/A'}</p>
                    <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email:</strong> {userInfo.email || 'N/A'}</p>
                    {userInfo.student_id && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Student ID:</strong> {userInfo.student_id}</p>}
                    {userInfo.batch_name && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Batch:</strong> {userInfo.batch_name}</p>}
                    {userInfo.faculty_id && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Faculty ID:</strong> {userInfo.faculty_id}</p>}
                    {userInfo.department && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Department:</strong> {userInfo.department}</p>}
                    {userInfo.child_name && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Child's Name:</strong> {userInfo.child_name}</p>}
                    {userInfo.admin_level && <p className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Admin Level:</strong> {userInfo.admin_level}</p>}
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Date Joined:</strong> {userInfo.date_joined || 'N/A'}</p>
                </div>
            ) : (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No user information available.</p>
            )}
            <BackToHomeButton />
        </div>
    );
};

// Attendance Page
const AttendancePage = () => {
    const { currentUser, setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    
    // Redirect teachers to selection page
    useEffect(() => {
        if (currentUser?.role === 'teacher') {
            setCurrentPage('teacher-attendance-selection');
            return;
        }
    }, [currentUser, setCurrentPage]);

    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    // Note: These variables are handled in TeacherBatchAttendancePage component

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        setError('');
        let url = '';

        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Attendance.');
            setLoading(false);
            return;
        }

        try {
            if (['teacher', 'admin', 'principal'].includes(currentUser.role)) {
                if (batches.length === 0) {
                    const batchResponse = await fetch('http://127.0.0.1:8000/api/timetable/batches/', {
                        headers: { Authorization: `Bearer ${currentUser.token}` }
                    });
                    if (!batchResponse.ok) throw new Error('Failed to fetch batches');
                    const batchData = await batchResponse.json();
                    setBatches(batchData);
                    if (batchData.length > 0 && !selectedBatchId) {
                        setSelectedBatchId(batchData[0].id);
                    }
                }
            }

            // Different URLs based on role and section
            if (currentUser.role === 'student') {
                url = `http://127.0.0.1:8000/api/attendance/attendance/my/`;
            } else if (currentUser.role === 'parent') {
                url = `http://127.0.0.1:8000/api/attendance/parent/student/attendance/`;
            } else if (currentUser.role === 'teacher') {
                // Teachers viewing their own attendance
                url = `http://127.0.0.1:8000/api/attendance/attendance/my/`;
            } else if (['admin', 'principal'].includes(currentUser.role)) {
                if (selectedStudentId) {
                    url = `http://127.0.0.1:8000/api/attendance/attendance/student/${selectedStudentId}/`;
                } else if (selectedBatchId) {
                    url = `http://127.0.0.1:8000/api/attendance/attendance/batch/${selectedBatchId}/`;
                } else {
                    url = `http://127.0.0.1:8000/api/attendance/attendance/all/`;
                }
            } else {
                setError('Unauthorized access for attendance.');
                setLoading(false);
                return;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                const errorText = contentType && contentType.includes('application/json')
                    ? (await response.json()).detail || (await response.json()).message || 'Failed to fetch attendance'
                    : await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            setAttendanceData(data);
        } catch (err) {
            setError(`Failed to load attendance data: ${err.message}`);
            console.error('Fetch error (Attendance):', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, selectedBatchId, selectedStudentId, batches]);

    // Note: fetchStudentsForBatch is handled in TeacherBatchAttendancePage component

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Note: handleMarkAttendance is implemented in TeacherBatchAttendancePage component

    const renderAttendanceTable = () => {
        if (loading) return <div className="text-center py-4">Loading attendance...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (attendanceData.length === 0) return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No attendance records found.</div>;

        const studentParentTable = (
            <div className={`overflow-x-auto rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Subject</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Batch</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        {attendanceData.map((record) => (
                            <tr key={record.id || `${record.date}-${record.subject}-${record.student?.id}`} className={`${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.date}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.subject}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.batch || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const adminTeacherTable = (
            <div className={`overflow-x-auto rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Student</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Batch</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Subject</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Marked By</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Confirmed</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        {attendanceData.map((record) => (
                            <tr key={record.id} className={`${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.student?.username || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.batch || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.subject}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.date}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.marked_by?.username || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.is_confirmed ? 'Yes' : 'No'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    <button className={`mr-2 ${
                                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                                    }`}>Edit</button>
                                    <button className={`${
                                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                                    }`}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        switch (currentUser.role) {
            case 'student':
            case 'parent':
                return studentParentTable;
            case 'admin':
            case 'principal':
                return (
                    <>
                        <div className="mb-4 flex gap-4">
                            <div>
                                <label className={`block mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Batch Filter:</label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => { setSelectedBatchId(e.target.value); setSelectedStudentId(''); }}
                                    className={`border rounded py-2 px-3 ${
                                        isDarkMode 
                                            ? 'border-gray-600 bg-gray-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                >
                                    <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>All Batches</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student ID:</label>
                                <input
                                    type="text"
                                    value={selectedStudentId}
                                    onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedBatchId(''); }}
                                    className={`border rounded py-2 px-3 ${
                                        isDarkMode 
                                            ? 'border-gray-600 bg-gray-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                    placeholder="Enter student ID"
                                />
                            </div>
                        </div>
                        {adminTeacherTable}
                        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Add Attendance Record</button>
                    </>
                );
            default:
                return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No attendance view for this role.</div>;
        }
    };

    return (
        <div>
            <SectionTitle>Attendance</SectionTitle>
            {renderAttendanceTable()}
            <BackToHomeButton />
        </div>
    );
};

// Grades Page
const GradesPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    
    // Grade form states
    const [showGradeForm, setShowGradeForm] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [gradeFormData, setGradeFormData] = useState({
        student: '',
        subject: '',
        marks: '',
        grade: '',
        remarks: ''
    });
    const [gradeMessage, setGradeMessage] = useState('');
    const [gradeError, setGradeError] = useState('');

    // Bulk upload states
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkMessage, setBulkMessage] = useState('');
    const [bulkError, setBulkError] = useState('');

    // Fetch students for grade upload
    const fetchStudents = useCallback(async () => {
        if (!currentUser?.token) return;
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/list/?role=student', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    }, [currentUser]);

    // Fetch batches for filtering
    const fetchBatches = useCallback(async () => {
        if (!currentUser?.token) return;
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/timetable/batches/', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
            }
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        }
    }, [currentUser]);

    // Fetches grades data based on user role and filters
    const fetchGrades = useCallback(async () => {
        setLoading(true);
        setError('');
        let url = '';

        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Grades.');
            setLoading(false);
            return;
        }

        try {
            if (currentUser.role === 'student') {
                url = `http://127.0.0.1:8000/api/grades/my/`;
            } else if (currentUser.role === 'parent') {
                url = `http://127.0.0.1:8000/api/grades/parent/student/grades/`;
            } else if (currentUser.role === 'teacher') {
                if (selectedStudentId) {
                    url = `http://127.0.0.1:8000/api/grades/student/${selectedStudentId}/`;
                } else if (selectedBatchId) {
                    url = `http://127.0.0.1:8000/api/grades/batch/${selectedBatchId}/`;
                } else {
                    url = `http://127.0.0.1:8000/api/grades/teacher/list/`;
                }
            } else if (currentUser.role === 'admin' || currentUser.role === 'principal') {
                if (selectedStudentId) {
                    url = `http://127.0.0.1:8000/api/grades/student/${selectedStudentId}/`;
                } else if (selectedBatchId) {
                    url = `http://127.0.0.1:8000/api/grades/batch/${selectedBatchId}/`;
                } else {
                    url = `http://127.0.0.1:8000/api/grades/admin/list/`;
                }
            } else {
                setError('Unauthorized access for grades.');
                setLoading(false);
                return;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                const errorText = contentType && contentType.includes('application/json')
                    ? (await response.json()).detail || (await response.json()).message || 'Failed to fetch grades'
                    : await response.text();
                throw new Error(errorText);
            }
            
            const data = await response.json();
            setGradesData(data);
        } catch (err) {
            setError(`Failed to load grades data: ${err.message}`);
            console.error('Fetch error (Grades):', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, selectedStudentId, selectedBatchId]);

    React.useEffect(() => {
        fetchGrades();
        fetchBatches();
        
        // Fetch students if teacher/admin/principal
        if (['teacher', 'admin', 'principal'].includes(currentUser?.role)) {
            fetchStudents();
        }
    }, [fetchGrades, fetchBatches, fetchStudents, currentUser]);

    // Handle grade form submission (add/edit)
    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setGradeMessage('');
        setGradeError('');

        if (!gradeFormData.student || !gradeFormData.subject || !gradeFormData.marks || !gradeFormData.grade) {
            setGradeError('Please fill in all required fields');
            return;
        }

        try {
            const url = editingGrade 
                ? `http://127.0.0.1:8000/api/grades/${editingGrade.id}/update/`
                : 'http://127.0.0.1:8000/api/grades/add/';
            
            const method = editingGrade ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    student: gradeFormData.student,
                    subject: gradeFormData.subject,
                    marks: parseFloat(gradeFormData.marks),
                    grade: gradeFormData.grade,
                    remarks: gradeFormData.remarks || ''
                })
            });

            if (response.ok) {
                setGradeMessage(editingGrade ? 'Grade updated successfully!' : 'Grade added successfully!');
                setGradeFormData({
                    student: '',
                    subject: '',
                    marks: '',
                    grade: '',
                    remarks: ''
                });
                setEditingGrade(null);
                setShowGradeForm(false);
                
                // Refresh grades data
                setTimeout(() => {
                    fetchGrades();
                }, 1000);
            } else {
                const errorData = await response.json();
                setGradeError(errorData.detail || errorData.message || 'Failed to save grade');
            }
        } catch (err) {
            setGradeError(`Error saving grade: ${err.message}`);
        }
    };

    // Handle grade deletion
    const handleDeleteGrade = async (gradeId) => {
        if (!window.confirm('Are you sure you want to delete this grade?')) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grades/${gradeId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (response.ok) {
                setGradeMessage('Grade deleted successfully!');
                setTimeout(() => {
                    fetchGrades();
                }, 1000);
            } else {
                const errorData = await response.json();
                setGradeError(errorData.detail || errorData.message || 'Failed to delete grade');
            }
        } catch (err) {
            setGradeError(`Error deleting grade: ${err.message}`);
        }
    };

    // Handle grade editing
    const handleEditGrade = (grade) => {
        setEditingGrade(grade);
        setGradeFormData({
            student: grade.student?.id || grade.student_id || '',
            subject: grade.subject || '',
            marks: grade.marks?.toString() || '',
            grade: grade.grade || '',
            remarks: grade.remarks || ''
        });
        setShowGradeForm(true);
    };

    // Handle bulk file upload
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        setBulkMessage('');
        setBulkError('');

        if (!bulkFile) {
            setBulkError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', bulkFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/grades/bulk-upload/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formData
            });

            if (response.ok) {
                setBulkMessage('Grades uploaded successfully!');
                setBulkFile(null);
                setShowBulkUpload(false);
                setTimeout(() => {
                    fetchGrades();
                }, 1000);
            } else {
                const errorData = await response.json();
                setBulkError(errorData.detail || errorData.message || 'Failed to upload grades');
            }
        } catch (err) {
            setBulkError(`Error uploading grades: ${err.message}`);
        }
    };

    // Renders the grades table
    const renderGradesTable = () => {
        if (loading) return <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p className="mt-2">Loading grades...</p></div>;
        if (error) return <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
        if (gradesData.length === 0) return <div className={`text-center py-8 p-4 rounded-lg ${
            isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-50'
        }`}>No grades records found.</div>;

        return (
            <div className="overflow-x-auto">
                {/* Filters for admin/principal/teacher */}
                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student ID:</label>
                            <input
                                type="text"
                                placeholder="Enter Student ID"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch:</label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setSelectedStudentId(''); setSelectedBatchId(''); }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                <div className={`overflow-x-auto rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <tr>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Student Name</th>}
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Subject</th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Marks</th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Grade</th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Remarks</th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Date</th>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-200 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            {gradesData.map((grade) => (
                                <tr key={grade.id || `${grade.subject}-${grade.student?.id || grade.student_id}`} className={`${
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}>
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                        <td className={`px-4 py-3 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {grade.student?.username || grade.student_name || 'N/A'}
                                        </td>
                                    )}
                                    <td className={`px-4 py-3 whitespace-nowrap font-medium ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{grade.subject}</td>
                                    <td className={`px-4 py-3 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{grade.marks}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                            grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                            grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {grade.grade}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>{grade.remarks || 'N/A'}</td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>{grade.date_recorded}</td>
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                        <td className={`px-4 py-3 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            <button 
                                                onClick={() => handleEditGrade(grade)}
                                                className={`mr-3 text-sm font-medium ${
                                                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                                                }`}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteGrade(grade.id)}
                                                className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                                                }`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action buttons */}
                {(currentUser.role === 'teacher' || currentUser.role === 'admin' || currentUser.role === 'principal') && (
                    <div className="mt-6 flex gap-4">
                        <button 
                            onClick={() => setShowGradeForm(!showGradeForm)}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-sm font-medium"
                        >
                            {showGradeForm ? 'Cancel' : 'Add Grade'}
                        </button>
                        <button 
                            onClick={() => setShowBulkUpload(!showBulkUpload)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-sm font-medium"
                        >
                            {showBulkUpload ? 'Cancel' : 'Bulk Upload'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render grade upload form
    const renderGradeForm = () => {
        if (!showGradeForm) return null;

        return (
            <div className={`mt-6 p-6 rounded-lg shadow-md border ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                    {editingGrade ? 'Edit Grade' : 'Add New Grade'}
                </h3>
                
                {gradeMessage && (
                    <div className={`mb-4 p-3 border rounded ${
                        isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-100 border-green-400 text-green-700'
                    }`}>
                        {gradeMessage}
                    </div>
                )}
                
                {gradeError && (
                    <div className={`mb-4 p-3 border rounded ${
                        isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
                    }`}>
                        {gradeError}
                    </div>
                )}

                <form onSubmit={handleGradeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Student *</label>
                            <select
                                value={gradeFormData.student}
                                onChange={(e) => setGradeFormData({...gradeFormData, student: e.target.value})}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Select a student</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.username} ({student.first_name} {student.last_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Subject *</label>
                            <input
                                type="text"
                                value={gradeFormData.subject}
                                onChange={(e) => setGradeFormData({...gradeFormData, subject: e.target.value})}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                }`}
                                placeholder="Enter subject name"
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Marks *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={gradeFormData.marks}
                                onChange={(e) => setGradeFormData({...gradeFormData, marks: e.target.value})}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                }`}
                                placeholder="Enter marks (0-100)"
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Grade *</label>
                            <select
                                value={gradeFormData.grade}
                                onChange={(e) => setGradeFormData({...gradeFormData, grade: e.target.value})}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Select grade</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="B-">B-</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="C-">C-</option>
                                <option value="D+">D+</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Remarks</label>
                        <textarea
                            value={gradeFormData.remarks}
                            onChange={(e) => setGradeFormData({...gradeFormData, remarks: e.target.value})}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                            }`}
                            rows="3"
                            placeholder="Enter any remarks (optional)"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowGradeForm(false);
                                setEditingGrade(null);
                                setGradeFormData({
                                    student: '',
                                    subject: '',
                                    marks: '',
                                    grade: '',
                                    remarks: ''
                                });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {editingGrade ? 'Update Grade' : 'Add Grade'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Render bulk upload form
    const renderBulkUploadForm = () => {
        if (!showBulkUpload) return null;

        return (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-4">Bulk Upload Grades</h3>
                
                {bulkMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {bulkMessage}
                    </div>
                )}
                
                {bulkError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {bulkError}
                    </div>
                )}

                <form onSubmit={handleBulkUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File *</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setBulkFile(e.target.files[0])}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            CSV should contain columns: student_id, subject, marks, grade, remarks (optional)
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowBulkUpload(false);
                                setBulkFile(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Upload Grades
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>Grades Management</SectionTitle>
            {renderGradesTable()}
            {renderGradeForm()}
            {renderBulkUploadForm()}
            <BackToHomeButton />
        </div>
    );
};

// Leaves Page
const LeavesPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [leavesData, setLeavesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaveForm, setLeaveForm] = useState({ start_date: '', end_date: '', reason: '' }); // Keys updated to match backend
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });

    // Handles submission of a new leave request
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setFormMessage({ text: '', type: '' });
        if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) { // Keys updated
            setFormMessage({ text: 'Please fill all fields.', type: 'error' });
            return;
        }

        if (!currentUser || !currentUser.token) {
            setFormMessage({ text: 'User not authenticated to submit leave.', type: 'error' });
            return;
        }
        console.log('LeavesPage: Submitting leave with token:', currentUser.token);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/leaves/', { // Using ViewSet base URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(leaveForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to submit leave request');
            }
            await response.json();
            setFormMessage({ text: 'Leave request submitted successfully!', type: 'success' });
            fetchLeaves(); // Refresh the list of leaves
            setLeaveForm({ start_date: '', end_date: '', reason: '' }); // Clear form
            console.log('LeavesPage: Leave submitted successfully.');
        } catch (err) {
            setFormMessage({ text: `Failed to submit leave: ${err.message}`, type: 'error' });
            console.error('Fetch error (Submit Leave):', err);
        }
    };

    // Fetches leave data based on user role
    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        setError('');
        let url = '';
        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Leaves.');
            setLoading(false);
            console.log('LeavesPage: currentUser or token missing for fetch.', currentUser);
            return;
        }

        try {
            // ViewSet handles roles by default get_queryset logic
            url = `http://127.0.0.1:8000/api/leaves/`; 

            console.log('LeavesPage: Fetching leaves from URL:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to load leaves data');
            }
            const data = await response.json(); // Assign the response to 'data'
            setLeavesData(data); // Use 'data' for state update
            setLoading(false);
            console.log('LeavesPage: Leaves data fetched successfully.', data);
        } catch (err) {
            setError(`Failed to load leaves data: ${err.message}`);
            setLoading(false);
            console.error('Fetch error (Fetch Leaves):', err);
        }
    }, [currentUser]); // Dependency on currentUser for fetchLeaves

    // Effect hook to call fetchLeaves when dependencies change
    React.useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    // Handle Approve/Reject status change
    const handleStatusChange = async (leaveId, newStatus) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/leaves/${leaveId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to update leave status');
            }
            await response.json();
            setFormMessage({ text: `Leave ${newStatus} successfully!`, type: 'success' });
            fetchLeaves(); // Refresh list
        } catch (err) {
            setFormMessage({ text: `Failed to update leave: ${err.message}`, type: 'error' });
            setError(`Failed to update leave: ${err.message}`);
            setLoading(false);
            console.error('Fetch error (Update Leave Status):', err);
        }
    };


    // Renders the leaves content, including form for students and tables for all
    const renderLeavesContent = () => {
        if (loading) return <div className="text-center py-4">Loading leaves...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

        return (
            <>
                {(currentUser.role === 'student' || currentUser.role === 'teacher') && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <SectionTitle>Apply for Leave</SectionTitle>
                        <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={leaveForm.start_date} // Key updated
                                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} // Key updated
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={leaveForm.end_date} // Key updated
                                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} // Key updated
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">Reason:</label>
                                <textarea
                                    id="reason"
                                    rows="3"
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Briefly describe your reason for leave"
                                    required
                                ></textarea>
                            </div>
                            <div className="col-span-full">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200">
                                    Submit Leave Request
                                </button>
                                {formMessage.text && (
                                    <p className={`mt-2 text-sm ${formMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formMessage.text}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                <SectionTitle>{(currentUser.role === 'student' || currentUser.role === 'teacher') ? 'My Leave Requests' : 'All Leave Requests'}</SectionTitle>
                {leavesData.length === 0 ? (
                    <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No leave requests found.</div>
                ) : (
                    <div className={`overflow-x-auto rounded-lg shadow-md ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <tr>
                                    {(currentUser.role !== 'student' && currentUser.role !== 'teacher' && currentUser.role !== 'parent') && <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Applicant</th>}
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Start Date</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>End Date</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Reason</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Status</th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Applied At</th>
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-200 ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                {leavesData.map((leave) => (
                                    <tr key={leave.id || `${leave.start_date}-${leave.user?.id}`} className={`${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        {(currentUser.role !== 'student' && currentUser.role !== 'teacher' && currentUser.role !== 'parent') && (
                                            <td className={`px-6 py-4 whitespace-nowrap ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {leave.user ? `${leave.user.username} (${leave.user.role})` : 'N/A'}
                                            </td>
                                        )}
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{leave.start_date}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{leave.end_date}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{leave.reason}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                                            leave.status === 'Approved' ? 'text-green-600' :
                                            leave.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>{leave.status}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{new Date(leave.applied_at).toLocaleDateString()}</td>
                                        {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {leave.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'approved')}
                                                            className={`mr-2 ${
                                                                isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                            }`}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                            className={`${
                                                                isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                                            }`}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {/* <button className="text-indigo-600 hover:text-indigo-900 ml-2">View</button> */}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
        );
    };

    return (
        <div>
            <SectionTitle>Leaves</SectionTitle>
            {renderLeavesContent()}
            <BackToHomeButton />
        </div>
    );
};

// Library Page
const LibraryPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [books, setBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [libraryLogs, setLibraryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetches various library-related data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Library.');
            setLoading(false);
            console.log('LibraryPage: currentUser or token missing.', currentUser);
            return;
        }
        console.log('LibraryPage: Fetching library data with token:', currentUser.token);

        try {
            // Fetch available books for all roles
            const availableBooksResponse = await fetch('http://127.0.0.1:8000/api/library/books/available/', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!availableBooksResponse.ok) {
                const errorData = await availableBooksResponse.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to fetch available books');
            }
            const availableBooksData = await availableBooksResponse.json();
            setBooks(availableBooksData);
            console.log('LibraryPage: Available books fetched successfully.', availableBooksData);

            // Fetch borrowed books and library attendance logs only for students
            if (currentUser.role === 'student') {
                const borrowedResponse = await fetch('http://127.0.0.1:8000/api/library/books/my/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!borrowedResponse.ok) {
                    const errorData = await borrowedResponse.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to fetch borrowed books');
                }
                const borrowedData = await borrowedResponse.json();
                setBorrowedBooks(borrowedData);
                console.log('LibraryPage: Borrowed books fetched successfully.', borrowedData);

                const logsResponse = await fetch('http://127.0.0.1:8000/api/library/attendance/my/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!logsResponse.ok) {
                    const errorData = await logsResponse.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to fetch library attendance logs');
                }
                const logsData = await logsResponse.json();
                setLibraryLogs(logsData);
                console.log('LibraryPage: Library logs fetched successfully.', logsData);
            }

            setLoading(false);
        } catch (err) {
            setError(`Failed to load library data: ${err.message}`);
            setLoading(false);
            console.error('Fetch error (Library):', err);
        }
    }, [currentUser]); // Dependency on currentUser

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBorrowBook = async (bookId) => {
        if (!currentUser || !currentUser.token) {
            setError('Please login to borrow a book.');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/library/books/borrow/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ book_id: bookId })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to borrow book');
            }
            window.alert('Book borrowed successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            window.alert(`Error borrowing book: ${err.message}`);
        }
    };

    const handleReturnBook = async (bookId) => {
        if (!currentUser || !currentUser.token) {
            setError('Please login to return a book.');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/library/books/return/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ book_id: bookId })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to return book');
            }
            window.alert('Book returned successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            window.alert(`Error returning book: ${err.message}`);
        }
    };

    const handleLibraryEntry = async () => {
        if (!currentUser || !currentUser.token) {
            setError('Please login to mark entry.');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/library/attendance/entry/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to mark entry');
            }
            window.alert('Library entry marked successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            window.alert(`Error marking entry: ${err.message}`);
        }
    };

    const handleLibraryExit = async () => {
        if (!currentUser || !currentUser.token) {
            setError('Please login to mark exit.');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/library/attendance/exit/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to mark exit');
            }
            window.alert('Library exit marked successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            window.alert(`Error marking exit: ${err.message}`);
        }
    };


    if (loading) return <div className="text-center py-8">Loading library data...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>Library</SectionTitle>
            {currentUser.role === 'student' && (
                <div className="mb-6 flex space-x-4">
                    <button onClick={handleLibraryEntry} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm">
                        Mark Library Entry
                    </button>
                    <button onClick={handleLibraryExit} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg shadow-sm">
                        Mark Library Exit
                    </button>
                </div>
            )}

            <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Available Books</h4>
                {books.length === 0 ? (
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No books currently available.</p>
                ) : (
                    <div className={`overflow-x-auto rounded-lg shadow-md ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Title</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Author</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Genre</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Available Copies</th>
                                    {currentUser.role === 'student' && (
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-200 ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                {books.map((book) => (
                                    <tr key={book.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.title}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.author}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.genre || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.available_copies}</td> {/* Changed from 'available' */}
                                        {currentUser.role === 'student' && (
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {book.available_copies > 0 ? (
                                                    <button onClick={() => handleBorrowBook(book.id)} className={`${
                                                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                    }`}>Borrow</button>
                                                ) : (
                                                    <span className={`${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>Out of Stock</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {currentUser.role === 'student' && (
                <>
                    <div className="mb-8">
                        <h4 className={`text-lg font-semibold mb-3 ${
                            isDarkMode ? 'text-white' : 'text-gray-700'
                        }`}>My Borrowed Books</h4>
                        {borrowedBooks.length === 0 ? (
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You have not borrowed any books.</p>
                        ) : (
                            <div className={`overflow-x-auto rounded-lg shadow-md ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className={`${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Book Title</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Borrow Date</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Due Date</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Status</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y divide-gray-200 ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                                    }`}>
                                        {borrowedBooks.map((borrow) => (
                                            <tr key={borrow.id} className={`${
                                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                            }`}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{borrow.book_title}</td> {/* Changed from bookTitle */}
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{borrow.borrow_date}</td> {/* Changed from borrowDate */}
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{borrow.due_date}</td> {/* Changed from returnDate */}
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{borrow.returned ? 'Returned' : 'Borrowed'}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {!borrow.returned && (
                                                        <button onClick={() => handleReturnBook(borrow.book.id)} className={`${
                                                            isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                        }`}>Return</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className={`text-lg font-semibold mb-3 ${
                            isDarkMode ? 'text-white' : 'text-gray-700'
                        }`}>My Library Check-in/out Logs</h4>
                        {libraryLogs.length === 0 ? (
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No library logs found.</p>
                        ) : (
                            <div className={`overflow-x-auto rounded-lg shadow-md ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className={`${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Entry Time</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>Exit Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y divide-gray-200 ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                                    }`}>
                                        {libraryLogs.map((log) => (
                                            <tr key={log.id} className={`${
                                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                            }`}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{log.entry_time}</td> {/* Changed from timestamp */}
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{log.exit_time || 'N/A'}</td> {/* Changed from type */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
            <BackToHomeButton />
        </div>
    );
};

// Library Management Page (Admin/Principal)
const LibraryManagementPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [allBooks, setAllBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [selectedBookForBorrowers, setSelectedBookForBorrowers] = useState(null);
    const [bookBorrowers, setBookBorrowers] = useState([]);
    const [showBorrowersModal, setShowBorrowersModal] = useState(false);

    // Form states
    const [addBookForm, setAddBookForm] = useState({
        title: '',
        author: '',
        isbn: '',
        total_copies: 1,
        genre: 'General'
    });

    const [editBookForm, setEditBookForm] = useState({
        title: '',
        author: '',
        isbn: '',
        total_copies: 1,
        genre: 'General'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        
        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Library Management.');
            setLoading(false);
            return;
        }

        try {
            // Fetch all books
            const allBooksResponse = await fetch('http://127.0.0.1:8000/api/library/admin/books/all/', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!allBooksResponse.ok) {
                const errorData = await allBooksResponse.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to fetch all books');
            }
            const allBooksData = await allBooksResponse.json();
            setAllBooks(allBooksData);

            // Fetch all borrowed books
            const borrowedResponse = await fetch('http://127.0.0.1:8000/api/library/admin/books/borrowed/', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!borrowedResponse.ok) {
                const errorData = await borrowedResponse.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to fetch borrowed books');
            }
            const borrowedData = await borrowedResponse.json();
            setBorrowedBooks(borrowedData.borrowed_books || []);

            setLoading(false);
        } catch (err) {
            setError(`Failed to load library management data: ${err.message}`);
            setLoading(false);
            console.error('Fetch error (Library Management):', err);
        }
    }, [currentUser]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        
        if (!addBookForm.title || !addBookForm.author) {
            window.alert('Title and author are required fields');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/library/admin/books/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(addBookForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to add book');
            }

            const result = await response.json();
            window.alert(result.message || 'Book added successfully');
            setShowAddForm(false);
            setAddBookForm({
                title: '',
                author: '',
                isbn: '',
                total_copies: 1,
                genre: 'General'
            });
            fetchData(); // Refresh the data
        } catch (err) {
            window.alert(`Failed to add book: ${err.message}`);
            console.error('Add book error:', err);
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        
        if (!editingBook) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/library/admin/books/${editingBook.id}/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(editBookForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to update book');
            }

            const result = await response.json();
            window.alert(result.message || 'Book updated successfully');
            setEditingBook(null);
            setEditBookForm({
                title: '',
                author: '',
                isbn: '',
                total_copies: 1,
                genre: 'General'
            });
            fetchData(); // Refresh the data
        } catch (err) {
            window.alert(`Failed to update book: ${err.message}`);
            console.error('Update book error:', err);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/library/admin/books/${bookId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to delete book');
            }

            const result = await response.json();
            window.alert(result.message || 'Book deleted successfully');
            fetchData(); // Refresh the data
        } catch (err) {
            window.alert(`Failed to delete book: ${err.message}`);
            console.error('Delete book error:', err);
        }
    };

    const handleViewBorrowers = async (bookId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/library/admin/books/${bookId}/borrowers/`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to fetch book borrowers');
            }

            const data = await response.json();
            setSelectedBookForBorrowers(data.book);
            setBookBorrowers(data);
            setShowBorrowersModal(true);
        } catch (err) {
            window.alert(`Failed to fetch book borrowers: ${err.message}`);
            console.error('Fetch borrowers error:', err);
        }
    };

    const startEditBook = (book) => {
        setEditingBook(book);
        setEditBookForm({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            total_copies: book.total_copies,
            genre: book.genre || 'General'
        });
    };

    if (loading) return <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading library management data...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>Library Management</SectionTitle>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Total Books</h3>
                    <p className={`text-3xl font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{allBooks.length}</p>
                </div>
                <div className={`p-6 rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Borrowed Books</h3>
                    <p className={`text-3xl font-bold ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>{borrowedBooks.length}</p>
                </div>
                <div className={`p-6 rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Available Books</h3>
                    <p className={`text-3xl font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{allBooks.filter(book => book.available_copies > 0).length}</p>
                </div>
            </div>

            {/* Add Book Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-sm"
                >
                    {showAddForm ? 'Cancel' : 'Add New Book'}
                </button>
            </div>

            {/* Add Book Form */}
            {showAddForm && (
                <div className={`mb-8 p-6 rounded-lg shadow-md border ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Add New Book</h3>
                    
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Title *</label>
                                <input
                                    type="text"
                                    value={addBookForm.title}
                                    onChange={(e) => setAddBookForm({...addBookForm, title: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter book title"
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Author *</label>
                                <input
                                    type="text"
                                    value={addBookForm.author}
                                    onChange={(e) => setAddBookForm({...addBookForm, author: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter author name"
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>ISBN</label>
                                <input
                                    type="text"
                                    value={addBookForm.isbn}
                                    onChange={(e) => setAddBookForm({...addBookForm, isbn: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter ISBN (optional)"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Total Copies</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={addBookForm.total_copies}
                                    onChange={(e) => setAddBookForm({...addBookForm, total_copies: parseInt(e.target.value) || 1})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Genre</label>
                                <input
                                    type="text"
                                    value={addBookForm.genre}
                                    onChange={(e) => setAddBookForm({...addBookForm, genre: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter genre"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm"
                            >
                                Add Book
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Book Form */}
            {editingBook && (
                <div className={`mb-8 p-6 rounded-lg shadow-md border ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Edit Book: {editingBook.title}</h3>
                    
                    <form onSubmit={handleEditBook} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Title *</label>
                                <input
                                    type="text"
                                    value={editBookForm.title}
                                    onChange={(e) => setEditBookForm({...editBookForm, title: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter book title"
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Author *</label>
                                <input
                                    type="text"
                                    value={editBookForm.author}
                                    onChange={(e) => setEditBookForm({...editBookForm, author: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter author name"
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>ISBN</label>
                                <input
                                    type="text"
                                    value={editBookForm.isbn}
                                    onChange={(e) => setEditBookForm({...editBookForm, isbn: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter ISBN (optional)"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Total Copies</label>
                                <input
                                    type="number"
                                    min={editingBook.currently_borrowed_count}
                                    value={editBookForm.total_copies}
                                    onChange={(e) => setEditBookForm({...editBookForm, total_copies: parseInt(e.target.value) || 1})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                <p className={`text-xs mt-1 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Minimum: {editingBook.currently_borrowed_count} (currently borrowed)</p>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>Genre</label>
                                <input
                                    type="text"
                                    value={editBookForm.genre}
                                    onChange={(e) => setEditBookForm({...editBookForm, genre: e.target.value})}
                                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter genre"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm"
                            >
                                Update Book
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingBook(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* All Books Table */}
            <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>All Books in Library</h4>
                {allBooks.length === 0 ? (
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No books in library.</p>
                ) : (
                    <div className={`overflow-x-auto rounded-lg shadow-md ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Title</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Author</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Genre</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Total Copies</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Borrowed</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Available</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-200 ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                {allBooks.map((book) => (
                                    <tr key={book.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.title}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.author}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.genre || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.total_copies}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.currently_borrowed_count}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{book.available_copies}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            <button
                                                onClick={() => startEditBook(book)}
                                                className={`mr-2 ${
                                                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                }`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleViewBorrowers(book.id)}
                                                className={`mr-2 ${
                                                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-900'
                                                }`}
                                            >
                                                View Borrowers
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBook(book.id)}
                                                className={`${
                                                    isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                                }`}
                                                disabled={book.currently_borrowed_count > 0}
                                                title={book.currently_borrowed_count > 0 ? 'Cannot delete: books are borrowed' : 'Delete book'}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Borrowed Books Table */}
            <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Currently Borrowed Books</h4>
                {borrowedBooks.length === 0 ? (
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No books are currently borrowed.</p>
                ) : (
                    <div className={`overflow-x-auto rounded-lg shadow-md ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Book Title</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Borrower</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Borrow Date</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Due Date</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-gray-200 ${
                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                {borrowedBooks.map((borrow) => (
                                    <tr key={borrow.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{borrow.book_title}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{borrow.user?.username || 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{borrow.borrow_date}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{borrow.due_date}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                            new Date(borrow.due_date) < new Date() ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {new Date(borrow.due_date) < new Date() ? 'Overdue' : 'Active'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Borrowers Modal */}
            {showBorrowersModal && selectedBookForBorrowers && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className={`p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Borrowers for: {selectedBookForBorrowers.title}</h3>
                            <button
                                onClick={() => setShowBorrowersModal(false)}
                                className={`text-2xl ${
                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className={`p-4 rounded-lg ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                                <h4 className={`font-semibold mb-2 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Borrows:</span>
                                        <span className={`ml-2 font-semibold ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{bookBorrowers.summary?.total_borrows || 0}</span>
                                    </div>
                                    <div>
                                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Borrows:</span>
                                        <span className={`ml-2 font-semibold ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{bookBorrowers.summary?.active_borrows_count || 0}</span>
                                    </div>
                                    <div>
                                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Returned:</span>
                                        <span className={`ml-2 font-semibold ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{bookBorrowers.summary?.returned_borrows_count || 0}</span>
                                    </div>
                                    <div>
                                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overdue:</span>
                                        <span className={`ml-2 font-semibold text-red-600`}>{bookBorrowers.summary?.overdue_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className={`font-semibold mb-3 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Active Borrows</h4>
                            {bookBorrowers.active_borrows && bookBorrowers.active_borrows.length > 0 ? (
                                <div className={`overflow-x-auto rounded-lg shadow-md ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-white'
                                }`}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className={`${
                                            isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Borrower</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Borrow Date</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Due Date</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y divide-gray-200 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-white'
                                        }`}>
                                            {bookBorrowers.active_borrows.map((borrow) => (
                                                <tr key={borrow.id} className={`${
                                                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.user?.username || 'N/A'}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.borrow_date}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.due_date}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                                                        new Date(borrow.due_date) < new Date() ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {new Date(borrow.due_date) < new Date() ? 'Overdue' : 'Active'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No active borrows for this book.</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h4 className={`font-semibold mb-3 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Returned Books</h4>
                            {bookBorrowers.returned_borrows && bookBorrowers.returned_borrows.length > 0 ? (
                                <div className={`overflow-x-auto rounded-lg shadow-md ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-white'
                                }`}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className={`${
                                            isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Borrower</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Borrow Date</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y divide-gray-200 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-white'
                                        }`}>
                                            {bookBorrowers.returned_borrows.map((borrow) => (
                                                <tr key={borrow.id} className={`${
                                                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.user?.username || 'N/A'}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.borrow_date}</td>
                                                    <td className={`px-4 py-2 whitespace-nowrap ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{borrow.due_date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No returned books for this book.</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowBorrowersModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BackToHomeButton />
        </div>
    );
};

// Payments Page
const PaymentsPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [paymentsData, setPaymentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [selectedPaymentIdForUpload, setSelectedPaymentIdForUpload] = useState(''); // New state for selecting payment to upload proof for
    
    // Payment request generation states
    const [showPaymentRequestForm, setShowPaymentRequestForm] = useState(false);
    const [students, setStudents] = useState([]);
    const [paymentRequestForm, setPaymentRequestForm] = useState({
        student_id: '',
        type: '',
        amount: '',
        due_date: '',
        payment_link: '',
        late_fine: '0'
    });
    const [paymentRequestMessage, setPaymentRequestMessage] = useState({ text: '', type: '' });

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Handles submission of payment proof file for a specific payment
    const handleUploadSubmit = async (event) => {
        event.preventDefault();
        setUploadMessage({ text: '', type: '' });
        if (!selectedFile) {
            setUploadMessage({ text: 'Please select a file to upload.', type: 'error' });
            return;
        }
        if (!selectedPaymentIdForUpload) {
            setUploadMessage({ text: 'Please select a payment to upload proof for.', type: 'error' });
            return;
        }

        if (!currentUser || !currentUser.token) {
            setUploadMessage({ text: 'User not authenticated to submit payment proof.', type: 'error' });
            return;
        }
        console.log('PaymentsPage: Submitting payment proof with token:', currentUser.token);

        const formData = new FormData();
        formData.append('payment_proof', selectedFile); // Backend expects 'payment_proof'

        setUploadMessage({ text: 'Uploading proof...', type: 'info' });
        try {
            // URL now includes the specific payment ID
            const response = await fetch(`http://127.0.0.1:8000/api/payments/${selectedPaymentIdForUpload}/submit-proof/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to upload proof');
            }
            await response.json();
            setUploadMessage({ text: 'Payment proof uploaded successfully! Status updated to Pending Proof.', type: 'success' });
            setSelectedFile(null); // Clear selected file
            setSelectedPaymentIdForUpload(''); // Clear selected payment
            fetchPayments(); // Refresh payments list
            console.log('PaymentsPage: Payment proof submitted successfully.');
        } catch (err) {
            setUploadMessage({ text: `Failed to upload payment proof: ${err.message}`, type: 'error' });
            console.error('Fetch error (Upload Proof):', err);
        }
    };

    // Fetches payments data based on user role
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError('');
        let url = '';
        if (!currentUser || !currentUser.token) {
            setError('User not authenticated for Payments.');
            setLoading(false);
            console.log('PaymentsPage: currentUser or token missing for fetch.', currentUser);
            return;
        }

        try {
            // ViewSet `get_queryset` handles filtering by role automatically for '/api/payments/'
            url = `http://127.0.0.1:8000/api/payments/`; 

            console.log('PaymentsPage: Fetching payments from URL:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to load payments data');
            }
            const data = await response.json(); // Correctly assign data here
            setPaymentsData(data);
            setLoading(false);
            console.log('PaymentsPage: Payments data fetched successfully.', data);
        } catch (err) {
            setError(`Failed to load payments data: ${err.message}`);
            setLoading(false);
            console.error('Fetch error (Fetch Payments):', err);
        }
    }, [currentUser]); // Dependency on currentUser

    // Effect hook to call fetchPayments when dependencies change
    React.useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Fetch students for payment request generation
    const fetchStudents = useCallback(async () => {
        if (!currentUser?.token) return;
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/list/?role=student', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    }, [currentUser]);

    // Handle payment request form submission
    const handlePaymentRequestSubmit = async (e) => {
        e.preventDefault();
        setPaymentRequestMessage({ text: '', type: '' });

        if (!currentUser?.token) {
            setPaymentRequestMessage({ text: 'User not authenticated.', type: 'error' });
            return;
        }

        // Validate required fields
        if (!paymentRequestForm.student_id || !paymentRequestForm.type || !paymentRequestForm.amount || !paymentRequestForm.due_date) {
            setPaymentRequestMessage({ text: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/payments/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(paymentRequestForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.detail || 'Failed to generate payment request');
            }

            const data = await response.json();
            setPaymentRequestMessage({ text: data.message || 'Payment request generated successfully!', type: 'success' });
            
            // Reset form
            setPaymentRequestForm({
                student_id: '',
                type: '',
                amount: '',
                due_date: '',
                payment_link: '',
                late_fine: '0'
            });
            
            // Refresh payments list
            fetchPayments();
            
            // Hide form after successful submission
            setTimeout(() => {
                setShowPaymentRequestForm(false);
                setPaymentRequestMessage({ text: '', type: '' });
            }, 3000);
        } catch (err) {
            setPaymentRequestMessage({ text: `Failed to generate payment request: ${err.message}`, type: 'error' });
        }
    };

    // Effect to fetch students when payment request form is shown
    useEffect(() => {
        if (showPaymentRequestForm && (currentUser?.role === 'admin' || currentUser?.role === 'principal')) {
            fetchStudents();
        }
    }, [showPaymentRequestForm, currentUser, fetchStudents]);

    // Handles marking payment as received by admin/principal
    const handleMarkReceived = async (paymentId) => {
        setLoading(true); // Indicate loading while status updates
        setError('');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/payments/${paymentId}/mark-received/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to mark payment received');
            }
            window.alert('Payment marked received successfully!');
            fetchPayments(); // Refresh the payments list to show updated status
        } catch (err) {
            setError(`Error marking payment received: ${err.message}`);
            window.alert(`Error: ${err.message}`); // Use alert for simplicity now, replace with custom modal
            setLoading(false);
        }
    };


    // Render payment request generation form
    const renderPaymentRequestForm = () => {
        if (!showPaymentRequestForm) return null;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Generate Payment Request</h3>
                
                {paymentRequestMessage.text && (
                    <div className={`mb-4 p-3 rounded ${
                        paymentRequestMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                        paymentRequestMessage.type === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {paymentRequestMessage.text}
                    </div>
                )}

                <form onSubmit={handlePaymentRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student *
                            </label>
                            <select
                                value={paymentRequestForm.student_id}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, student_id: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Student</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.username} - {student.first_name} {student.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Type *
                            </label>
                            <input
                                type="text"
                                value={paymentRequestForm.type}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, type: e.target.value})}
                                placeholder="e.g., Tuition Fee, Library Fine, etc."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                value={paymentRequestForm.amount}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, amount: e.target.value})}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                value={paymentRequestForm.due_date}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, due_date: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={paymentRequestForm.payment_link}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, payment_link: e.target.value})}
                                placeholder="https://payment-gateway.com/pay"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Late Fine (₹)
                            </label>
                            <input
                                type="number"
                                value={paymentRequestForm.late_fine}
                                onChange={(e) => setPaymentRequestForm({...paymentRequestForm, late_fine: e.target.value})}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Generate Payment Request
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowPaymentRequestForm(false);
                                setPaymentRequestMessage({ text: '', type: '' });
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Renders the payments table
    const renderPaymentsTable = () => {
        if (loading) return <div className="text-center py-4">Loading payments...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (paymentsData.length === 0) return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No payment records found.</div>;

        return (
            <div className={`overflow-x-auto rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <tr>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Student Name</th>}
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Type</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Amount</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Due Date</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        {paymentsData.map((payment) => (
                            <tr key={payment.id} className={`${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal') && <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{payment.student_name || payment.student?.username || 'N/A'}</td>}
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{payment.type}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>₹{payment.amount.toLocaleString()}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{payment.due_date}</td> {/* Changed from dueDate */}
                                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                                    payment.status === 'received' ? 'text-green-600' :
                                    payment.status === 'pending' || payment.status === 'due' ? 'text-red-600' : 'text-yellow-600' // 'pending_proof' will be yellow
                                }`}>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</td> {/* Capitalize status */}
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {/* Student/Parent specific actions */}
                                    {(currentUser.role === 'student' || currentUser.role === 'parent') && (payment.status === 'pending' || payment.status === 'due') && (
                                        <>
                                            {/* Link to payment gateway if available */}
                                            {payment.payment_link && (
                                                <a href={payment.payment_link} target="_blank" rel="noopener noreferrer" className={`mr-2 ${
                                                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                }`}>Pay Now</a>
                                            )}
                                            {/* Select payment for proof upload */}
                                            {payment.status !== 'pending_proof' && (
                                                <button onClick={() => setSelectedPaymentIdForUpload(payment.id)} className={`mr-2 ${
                                                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-900'
                                                }`}>Upload Proof</button>
                                            )}
                                        </>
                                    )}

                                    {/* Admin/Principal specific actions */}
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                                        <>
                                            {payment.status === 'pending_proof' && (
                                                <a href={payment.payment_proof} target="_blank" rel="noopener noreferrer" className={`mr-2 ${
                                                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-900'
                                                }`}>View Proof</a>
                                            )}
                                            {payment.status !== 'received' && (
                                                <button 
                                                    onClick={() => handleMarkReceived(payment.id)}
                                                    className={`ml-2 ${
                                                        isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                    }`}
                                                >
                                                    Mark Received
                                                </button>
                                            )}
                                            {/* Add Edit/Delete buttons for admin if needed */}
                                            <button className={`ml-2 ${
                                                isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'
                                            }`}>Details</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-sm">Issue New Payment/Fine</button>
                )}
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>Payments</SectionTitle>
            
            {/* Admin/Principal Payment Request Generation */}
            {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Payment Management</h3>
                        <button
                            onClick={() => setShowPaymentRequestForm(!showPaymentRequestForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {showPaymentRequestForm ? 'Cancel' : 'Generate Payment Request'}
                        </button>
                    </div>
                    {renderPaymentRequestForm()}
                </div>
            )}

            {/* Student/Parent Payment Proof Upload */}
            {(currentUser.role === 'student' || currentUser.role === 'parent') && (
                <div className={`p-6 rounded-lg shadow-md mb-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <SectionTitle>Upload Payment Proof</SectionTitle>
                    <form onSubmit={handleUploadSubmit} className="flex flex-col space-y-4">
                         <label htmlFor="paymentSelect" className={`block text-sm font-bold mb-2 ${
                             isDarkMode ? 'text-white' : 'text-gray-700'
                         }`}>Select Payment to Upload Proof For:</label>
                        <select
                            id="paymentSelect"
                            value={selectedPaymentIdForUpload}
                            onChange={(e) => setSelectedPaymentIdForUpload(e.target.value)}
                            className={`shadow border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mb-4 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'text-gray-700 border-gray-300'
                            }`}
                            required
                        >
                            <option value="">Select a Payment</option>
                            {paymentsData.filter(p => p.status === 'pending' || p.status === 'due' || p.status === 'pending_proof').map(payment => (
                                <option key={payment.id} value={payment.id}>
                                    {payment.type} (Amount: ₹{payment.amount}, Due: {payment.due_date}, Status: {payment.status})
                                </option>
                            ))}
                        </select>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf" // Specify accepted file types
                            onChange={handleFileChange}
                            className={`block w-full text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100`}
                        />
                        <button
                            type="submit"
                            disabled={!selectedFile || !selectedPaymentIdForUpload}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
                        >
                            Submit Proof
                        </button>
                        {uploadMessage.text && (
                            <p className={`text-sm ${uploadMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {uploadMessage.text}
                            </p>
                        )}
                    </form>
                </div>
            )}

            {renderPaymentsTable()}
            <BackToHomeButton />
        </div>
    );
};

// Timetable Page
const TimetablePage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const { currentUser } = useContext(AppContext);
    const [timetableData, setTimetableData] = useState([]);
    const [timetableFiles, setTimetableFiles] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        batch: '',
        term: '',
        effective_date: '',
        title: '',
        description: '',
        file_type: 'image'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch timetable data and files
    React.useEffect(() => {
        const fetchTimetableData = async () => {
            setLoading(true);
            setError('');
            
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for Timetable.');
                setLoading(false);
                return;
            }

            try {
                // Fetch structured timetable data
                const classesResponse = await fetch('http://127.0.0.1:8000/api/timetable/classes/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                
                // Fetch timetable files
                const filesResponse = await fetch('http://127.0.0.1:8000/api/timetable/files/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                
                // Fetch batches for upload form
                const batchesResponse = await fetch('http://127.0.0.1:8000/api/timetable/batches/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });

                if (!classesResponse.ok || !filesResponse.ok || !batchesResponse.ok) {
                    throw new Error('Failed to fetch timetable data');
                }

                const classesData = await classesResponse.json();
                const filesData = await filesResponse.json();
                const batchesData = await batchesResponse.json();

                setTimetableData(classesData);
                setTimetableFiles(filesData);
                setBatches(batchesData);
                setLoading(false);
            } catch (err) {
                setError(`Failed to load timetable: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (Timetable):', err);
            }
        };
        fetchTimetableData();
    }, [currentUser]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        
        // Auto-detect file type
        if (file) {
            const extension = file.name.toLowerCase().split('.').pop();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
                setUploadForm(prev => ({ ...prev, file_type: 'image' }));
            } else if (extension === 'pdf') {
                setUploadForm(prev => ({ ...prev, file_type: 'pdf' }));
            } else if (['xls', 'xlsx'].includes(extension)) {
                setUploadForm(prev => ({ ...prev, file_type: 'excel' }));
            }
        }
    };

    const handleUploadSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('batch', uploadForm.batch);
            formData.append('term', uploadForm.term);
            formData.append('effective_date', uploadForm.effective_date);
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('file_type', uploadForm.file_type);

            const response = await fetch('http://127.0.0.1:8000/api/timetable/files/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Upload failed');
            }

            // Refresh the files list
            const filesResponse = await fetch('http://127.0.0.1:8000/api/timetable/files/', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const filesData = await filesResponse.json();
            setTimetableFiles(filesData);

            // Reset form
            setUploadForm({
                batch: '',
                term: '',
                effective_date: '',
                title: '',
                description: '',
                file_type: 'image'
            });
            setSelectedFile(null);
            setShowUploadForm(false);
            setUploading(false);
        } catch (err) {
            setError(`Upload failed: ${err.message}`);
            setUploading(false);
        }
    };

    const renderUploadForm = () => {
        if (!showUploadForm) return null;

        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Upload Timetable</h3>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <select
                                value={uploadForm.batch}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, batch: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Batch</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                            <input
                                type="text"
                                value={uploadForm.term}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, term: e.target.value }))}
                                placeholder="e.g., Semester 1, Annual"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                            <input
                                type="date"
                                value={uploadForm.effective_date}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, effective_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                            <select
                                value={uploadForm.file_type}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, file_type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="image">Image (PNG, JPG, JPEG)</option>
                                <option value="pdf">PDF Document</option>
                                <option value="excel">Excel File (XLS, XLSX)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Timetable title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Timetable description"
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.xls,.xlsx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">Supported formats: Images (JPG, PNG, GIF, BMP), PDF, Excel (XLS, XLSX). Max size: 10MB</p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg shadow-sm"
                        >
                            {uploading ? 'Uploading...' : 'Upload Timetable'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUploadForm(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderTimetableFiles = () => {
        if (timetableFiles.length === 0) {
            return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No timetable files uploaded yet.</div>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {timetableFiles.map((file) => (
                    <div key={file.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    file.file_type === 'image' ? 'bg-blue-500' :
                                    file.file_type === 'pdf' ? 'bg-red-500' : 'bg-green-500'
                                }`}>
                                    {file.file_type === 'image' ? '📷' : file.file_type === 'pdf' ? '📄' : '📊'}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {file.title || `${file.batch_name} Timetable`}
                                    </h3>
                                    <p className="text-sm text-gray-500">{file.batch_name}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                            {file.term && <p><span className="font-medium">Term:</span> {file.term}</p>}
                            {file.effective_date && <p><span className="font-medium">Effective:</span> {new Date(file.effective_date).toLocaleDateString()}</p>}
                            <p><span className="font-medium">Type:</span> {file.file_type.toUpperCase()}</p>
                            <p><span className="font-medium">Size:</span> {file.file_size}</p>
                            <p><span className="font-medium">Uploaded:</span> {new Date(file.uploaded_at).toLocaleDateString()}</p>
                            {file.description && <p><span className="font-medium">Description:</span> {file.description}</p>}
                        </div>

                        <div className="mt-4 flex space-x-2">
                            <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
                            >
                                View File
                            </a>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm">
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTimetableTable = () => {
        if (loading) return <div className="text-center py-4">Loading timetable...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (timetableData.length === 0) return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No structured timetable found.</div>;

        return (
            <div className={`overflow-x-auto rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Day</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Time</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Subject</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Room</th>
                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Batch</th>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Teacher</th>}
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        {timetableData.map((item) => (
                            <tr key={item.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.day}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.time}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.subject}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.room || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.batch_name || 'N/A'}</td>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal') && <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.teacher_name || 'N/A'}</td>}
                                {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                                        <button className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                    <button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-sm">Create Class</button>
                )}
                {currentUser.role === 'teacher' && (
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-sm">Request Substitution</button>
                )}
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>Timetable</SectionTitle>
            
            {/* Upload Section for Admin/Principal */}
            {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Timetable Files</h2>
                        <button
                            onClick={() => setShowUploadForm(!showUploadForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm"
                        >
                            {showUploadForm ? 'Cancel Upload' : 'Upload Timetable'}
                        </button>
                    </div>
                    {renderUploadForm()}
                </div>
            )}

            {/* Timetable Files Section */}
            <div className="mb-8">
                                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Uploaded Timetables</h2>
                {renderTimetableFiles()}
            </div>

            {/* Structured Timetable Section */}
            <div className="mb-8">
                                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Structured Timetable</h2>
                {renderTimetableTable()}
            </div>
            
            <BackToHomeButton />
        </div>
    );
};

const CollegeInOutLogPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError('');
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for College In/Out Log.');
                setLoading(false);
                console.log('CollegeInOutLogPage: currentUser or token missing.', currentUser);
                return;
            }

            if (currentUser.role !== 'admin' && currentUser.role !== 'principal' && currentUser.role !== 'hidden_superuser') {
                setError('Unauthorized access for College In/Out Log. Only Admin/Principal can view.');
                setLoading(false);
                console.log('CollegeInOutLogPage: Unauthorized role for fetch.', currentUser.role);
                return;
            }
            console.log('CollegeInOutLogPage: Fetching logs with token:', currentUser.token);

            try {
                const response = await fetch('http://127.0.0.1:8000/api/college-in-out-log/logs/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to fetch college logs');
                }
                const data = await response.json();
                setLogs(data.results || data); 
                setLoading(false);
                console.log('CollegeInOutLogPage: Logs fetched successfully.', data);
            } catch (err) {
                setError(`Failed to load college entry/exit logs: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (College Logs):', err);
            }
        };
        fetchLogs();
    }, [currentUser]); 

    if (loading) return <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading logs...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>College Entry/Exit Logs</SectionTitle>
            {logs.length === 0 ? (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No college entry/exit logs found.</div>
            ) : (
                <div className={`overflow-x-auto rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>User</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Entry Time</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Exit Time</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Marked By</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-200 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            {logs.map((log) => (
                                <tr key={log.id} className={`${
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.student?.username || 'N/A'} ({log.student?.role || 'N/A'})</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{new Date(log.entry_time).toLocaleString()}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.marked_by?.username || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <BackToHomeButton />
        </div>
    );
};

const HostelAttendancePage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError('');
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for Hostel Attendance.');
                setLoading(false);
                console.log('HostelAttendancePage: currentUser or token missing.', currentUser);
                return;
            }

            if (currentUser.role !== 'admin' && currentUser.role !== 'principal' && currentUser.role !== 'hidden_superuser') {
                setError('Unauthorized access for Hostel Attendance. Only Admin/Principal can view.');
                setLoading(false);
                console.log('HostelAttendancePage: Unauthorized role for fetch.', currentUser.role);
                return;
            }
            console.log('HostelAttendancePage: Fetching logs with token:', currentUser.token);

            try {
                const response = await fetch('http://127.0.0.1:8000/api/hostel-attendance/logs/', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to fetch hostel logs');
                }
                const data = await response.json();
                setLogs(data.results || data);
                setLoading(false);
                console.log('HostelAttendancePage: Logs fetched successfully.', data);
            } catch (err) {
                setError(`Failed to load hostel attendance logs: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (Hostel Logs):', err);
            }
        };
        fetchLogs();
    }, [currentUser]);

    if (loading) return <div className={`text-center py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading logs...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>Hostel Attendance</SectionTitle>
            {logs.length === 0 ? (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No hostel attendance logs found.</div>
            ) : (
                <div className={`overflow-x-auto rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>User</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Entry Time</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Exit Time</th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Marked By</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-200 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            {logs.map((log) => (
                                <tr key={log.id} className={`${
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.student?.username || 'N/A'} ({log.student?.role || 'N/A'})</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{new Date(log.entry_time).toLocaleString()}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{log.marked_by?.username || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <BackToHomeButton />
        </div>
    );
};

const StudentsFacultyInfoPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const handleEdit = (user) => {
        setEditUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name || '',
        });
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action is irreversible.")) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Failed to delete user');
            }

            window.alert('User deleted successfully.');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Delete User Error:', err);
            window.alert(`Error deleting user: ${err.message}`);
        }
    };

    const handleExportCSV = () => {
        const csvRows = [
            ['ID', 'Username', 'Email', 'Role', 'Full Name'],
            ...users.map(u => [u.id, u.username, u.email || '', u.role, u.full_name || ''])
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'users_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('http://127.0.0.1:8000/api/users/bulk-upload/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || errData.message || 'Upload failed');
            }

            window.alert('Bulk upload successful!');
            window.location.reload();
        } catch (err) {
            console.error('Bulk upload error:', err);
            window.alert(`Bulk upload failed: ${err.message}`);
        }
    };

    React.useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for Users Info.');
                setLoading(false);
                return;
            }

            if (!['admin', 'principal', 'hidden_superuser'].includes(currentUser.role)) {
                setError('Unauthorized access for Users Info. Only Admin/Principal can view.');
                setLoading(false);
                return;
            }

            try {
                let url = `http://127.0.0.1:8000/api/users/list/`;
                if (filterRole) {
                    url += `?role=${filterRole}`;
                }

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to fetch users list');
                }
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError(`Failed to load user information: ${err.message}`);
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser, filterRole]);

    if (loading) return <div className="text-center py-8">Loading users...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>Students & Faculty Information</SectionTitle>
            <div className="mb-4">
                <label htmlFor="roleFilter" className={`block text-sm font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>Filter by Role:</label>
                <select
                    id="roleFilter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={`shadow border rounded w-1/3 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                        isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-700'
                    }`}
                >
                    <option value="">All Users</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                    <option value="principal">Principal</option>
                </select>
            </div>

            <div className="mb-4 flex flex-wrap gap-4">
                <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm">Export CSV</button>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm cursor-pointer">
                    Upload Excel
                    <input type="file" accept=".csv, .xlsx" onChange={handleBulkUpload} hidden />
                </label>
            </div>

            {users.length === 0 ? (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No users found for this filter.</div>
            ) : (
                <div className={`overflow-x-auto rounded-lg shadow-md ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Username</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Role</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Email</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                }`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-200 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            {users.map((user) => (
                                <tr key={user.id} className={`${
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{user.username}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{user.role}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleEdit(user)} className={`mr-2 ${
                                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-indigo-600 hover:text-indigo-900'
                                        }`}>Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className={`${
                                            isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                        }`}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className={`p-6 rounded-lg w-full max-w-md relative shadow-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit User: {editUser.username}</h3>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const response = await fetch(`http://127.0.0.1:8000/api/users/${editUser.id}/`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${currentUser.token}`
                                    },
                                    body: JSON.stringify(editFormData)
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.detail || errorData.message || 'Failed to update user');
                                }

                                const updated = await response.json();
                                setUsers(users.map(u => u.id === updated.id ? updated : u));
                                setEditUser(null);
                            } catch (err) {
                                console.error('Update error:', err);
                                window.alert(`Failed to update user: ${err.message}`);
                            }
                        }}>
                            <input
                                type="text"
                                value={editFormData.username}
                                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                className={`w-full border px-3 py-2 rounded mb-3 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className={`w-full border px-3 py-2 rounded mb-3 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                value={editFormData.full_name}
                                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                className={`w-full border px-3 py-2 rounded mb-3 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="Full Name"
                            />

                            <div className="flex justify-between">
                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save</button>
                                <button type="button" onClick={() => setEditUser(null)} className={`underline ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <BackToHomeButton />
        </div>
    );
};

const LoginPage = () => {
    const { setCurrentUser, setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginMessage({ text: '', type: '' });

        if (!username || !password || !role) {
            setLoginMessage({ text: 'Please fill in all fields.', type: 'error' });
            return;
        }

        const backendUrl = `http://127.0.0.1:8000/api/users/login/`; 

        const payload = { username: username, password: password, role: role }; 

        setLoginMessage({ text: 'Logging in...', type: 'info' });

        try {
            console.log('Attempting login to URL:', backendUrl);
            console.log('Sending payload:', payload);
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Full Backend Login Response Data:', data); 

                const accessToken = data.access; 
                const userRole = data.role; 
                const userId = data.id; 
                const userName = data.username;
                const isHiddenSuperuser = data.is_hidden_superuser || false;

                console.log('LoginPage: accessToken value before setCurrentUser:', accessToken);

                if (accessToken) {
                    // Store tokens in localStorage for API calls
                    localStorage.setItem('access_token', accessToken);
                    localStorage.setItem('refresh_token', data.refresh);
                    
                    setCurrentUser({
                        id: userId,
                        username: userName,
                        role: userRole,
                        token: accessToken,
                        is_hidden_superuser: isHiddenSuperuser
                    });
                    setLoginMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                    setCurrentPage('dashboard');
                    console.log('Login successful: Stored currentUser:', { id: userId, username: userName, role: userRole, token: accessToken, is_hidden_superuser: isHiddenSuperuser });
                } else {
                    setLoginMessage({ text: 'Login failed: No access token received.', type: 'error' });
                    console.error('Login failed: No access token in response:', data);
                }
            } else {
                const errorData = await response.json();
                setLoginMessage({ text: `Login failed: ${errorData.detail || errorData.message || 'Invalid credentials.'}`, type: 'error' });
                console.error('Login failed:', response.status, errorData);
            }
        } catch (error) {
            setLoginMessage({ text: 'An error occurred during login. Please ensure backend is running and CORS is configured.', type: 'error' });
            console.error('Fetch error:', error);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
            <div className={`p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border transition-colors duration-300 ${
                isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            }`}>
                <div className="mb-8">
                    <MAMCLogo />
                </div>

                <h2 className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Management System Login</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
                    {}
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-lg transition duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        required
                    />

                    {}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg text-lg transition duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {}
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-lg appearance-none cursor-pointer transition duration-200 focus:ring-blue-500 focus:border-blue-500 ${
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

                    {}
                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 text-lg"
                    >
                        Login
                    </button>
                </form>

                {}
                {loginMessage.text && (
                    <div
                        className={`mt-6 p-4 rounded-lg text-left transition-colors duration-300 ${
                            loginMessage.type === 'success' ? 
                                (isDarkMode ? 'bg-green-900 text-green-200 border border-green-600' : 'bg-green-100 text-green-800 border border-green-300') :
                            loginMessage.type === 'error'   ? 
                                (isDarkMode ? 'bg-red-900 text-red-200 border border-red-600' : 'bg-red-100 text-red-800 border border-red-300') :
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
const CreateUserPage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState('create-user'); // 'create-user' or 'manage-batches'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        student_id: '',
        faculty_id: '',
        department: '',
        batch: '',
        child_id: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    
    // Batch management state
    const [newBatchName, setNewBatchName] = useState('');
    const [newBatchDescription, setNewBatchDescription] = useState('');
    const [selectedBatchForAssignment, setSelectedBatchForAssignment] = useState('');
    const [selectedStudentsForAssignment, setSelectedStudentsForAssignment] = useState([]);
    const [batchMessage, setBatchMessage] = useState('');
    const [batchError, setBatchError] = useState('');

    const fetchDropdownData = useCallback(async () => {
        if (!currentUser?.token) return;
        try {
            const headers = { 'Authorization': `Bearer ${currentUser.token}` };

            const batchRes = await fetch('http://127.0.0.1:8000/api/timetable/batches/', { headers });
            const studentRes = await fetch('http://127.0.0.1:8000/api/users/list/?role=student', { headers });

            const batchData = await batchRes.json();
            const studentData = await studentRes.json();

            setBatches(batchData);
            setStudents(studentData);
        } catch (err) {
            console.error('Dropdown Fetch Error:', err);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            // Clean up the payload to match backend expectations
            const payload = { ...formData };
            
            // Remove empty fields to avoid validation issues
            Object.keys(payload).forEach(key => {
                if (payload[key] === '' || payload[key] === null) {
                    delete payload[key];
                }
            });
            
            const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || data.message || 'Failed to create user');
            }
            setMessage('User created successfully!');
            setFormData({
                username: '', password: '', role: '', first_name: '',
                last_name: '', email: '', student_id: '', faculty_id: '',
                department: '', batch: '', child_id: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle creating new batch
    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setBatchMessage('');
        setBatchError('');
        
        if (!newBatchName.trim()) {
            setBatchError('Batch name is required');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/timetable/batches/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    name: newBatchName,
                    description: newBatchDescription
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || data.message || 'Failed to create batch');
            }

            setBatchMessage('Batch created successfully!');
            setNewBatchName('');
            setNewBatchDescription('');
            fetchDropdownData(); // Refresh batches list
        } catch (err) {
            setBatchError(err.message);
        }
    };

    // Handle assigning students to batch
    const handleAssignStudentsToBatch = async () => {
        if (!selectedBatchForAssignment || selectedStudentsForAssignment.length === 0) {
            setBatchError('Please select a batch and at least one student');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/assign-batch/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    batch_id: selectedBatchForAssignment,
                    user_ids: selectedStudentsForAssignment
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || data.message || 'Failed to assign students to batch');
            }

            setBatchMessage('Students assigned to batch successfully!');
            setSelectedBatchForAssignment('');
            setSelectedStudentsForAssignment([]);
            fetchDropdownData(); // Refresh data
        } catch (err) {
            setBatchError(err.message);
        }
    };

    if (!currentUser || !['admin', 'principal', 'hidden_superuser'].includes(currentUser.role)) {
        return <div className="text-center py-10 text-red-600">Unauthorized to create users.</div>;
    }

    return (
        <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            <SectionTitle>User & Batch Management</SectionTitle>
            
            {/* Tab Navigation */}
            <div className={`mb-6 flex space-x-4 border-b ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
                <button
                    onClick={() => setActiveTab('create-user')}
                    className={`py-2 px-4 font-medium ${
                        activeTab === 'create-user'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Create User
                </button>
                <button
                    onClick={() => setActiveTab('manage-batches')}
                    className={`py-2 px-4 font-medium ${
                        activeTab === 'manage-batches'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Manage Batches
                </button>
            </div>

            {activeTab === 'create-user' ? (
                // Create User Section
                <div>
                    <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Username" value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} required />

                        <input type="password" placeholder="Password" value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} required />

                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} required>
                            <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Role</option>
                            <option value="student" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Student</option>
                            <option value="teacher" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Teacher</option>
                            <option value="parent" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Parent</option>
                            <option value="principal" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Principal</option>
                            <option value="admin" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Admin</option>
                        </select>

                        <input type="text" placeholder="First Name" value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} />

                        <input type="text" placeholder="Last Name" value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} />

                        <input type="email" placeholder="Email" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full border rounded px-4 py-2 ${
                                isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                            }`} />

                        {formData.role === 'student' && (
                            <select value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                className={`w-full border rounded px-4 py-2 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}>
                                <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Batch</option>
                                {batches.map(b => <option key={b.id} value={b.id} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{b.name}</option>)}
                            </select>
                        )}

                        {formData.role === 'teacher' && (
                            <>
                                <input type="text" placeholder="Faculty ID" value={formData.faculty_id}
                                    onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                                    className={`w-full border rounded px-4 py-2 ${
                                        isDarkMode 
                                            ? 'border-gray-600 bg-gray-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`} />
                                <input type="text" placeholder="Department" value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className={`w-full border rounded px-4 py-2 ${
                                        isDarkMode 
                                            ? 'border-gray-600 bg-gray-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`} />
                            </>
                        )}

                        {formData.role === 'parent' && (
                            <select value={formData.child_id}
                                onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                                className={`w-full border rounded px-4 py-2 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}>
                                <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Child</option>
                                {students.map(s => <option key={s.id} value={s.id} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{s.username} ({s.first_name} {s.last_name})</option>)}
                            </select>
                        )}

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                            Create User
                        </button>

                        {message && <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{message}</p>}
                        {error && <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
                    </form>
                </div>
            ) : (
                // Manage Batches Section
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Manage Batches</h3>
                    
                    {/* Create New Batch */}
                    <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Batch</h4>
                        <form onSubmit={handleCreateBatch} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Batch Name (e.g., MBBS 1st Year A)"
                                value={newBatchName}
                                onChange={(e) => setNewBatchName(e.target.value)}
                                className={`w-full border rounded px-4 py-2 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                            />
                            <textarea
                                placeholder="Batch Description (optional)"
                                value={newBatchDescription}
                                onChange={(e) => setNewBatchDescription(e.target.value)}
                                className={`w-full border rounded px-4 py-2 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                rows="2"
                            />
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                                Create Batch
                            </button>
                        </form>
                    </div>

                    {/* Assign Students to Batch */}
                    <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assign Students to Batch</h4>
                        <div className="space-y-3">
                            <select
                                value={selectedBatchForAssignment}
                                onChange={(e) => setSelectedBatchForAssignment(e.target.value)}
                                className={`w-full border rounded px-4 py-2 ${
                                    isDarkMode 
                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                            >
                                <option value="" className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Select Batch</option>
                                {batches.map(b => <option key={b.id} value={b.id} className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>{b.name}</option>)}
                            </select>

                            <div>
                                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Students:</label>
                                <div className={`max-h-40 overflow-y-auto border rounded p-2 ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}>
                                    {students.map(student => (
                                        <label key={student.id} className={`flex items-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentsForAssignment.includes(student.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStudentsForAssignment([...selectedStudentsForAssignment, student.id]);
                                                    } else {
                                                        setSelectedStudentsForAssignment(selectedStudentsForAssignment.filter(id => id !== student.id));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            {student.username} ({student.first_name} {student.last_name})
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAssignStudentsToBatch}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            >
                                Assign Students to Batch
                            </button>
                        </div>
                    </div>

                    {/* Current Batches */}
                    <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Current Batches</h4>
                        <div className="space-y-2">
                            {batches.map(batch => (
                                <div key={batch.id} className={`p-3 rounded border ${
                                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                                }`}>
                                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{batch.name}</div>
                                    {batch.description && <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{batch.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {batchMessage && <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{batchMessage}</p>}
                    {batchError && <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{batchError}</p>}
                </div>
            )}
            
            <BackToHomeButton />
        </div>
    );
};

// Teacher Attendance Selection Page
const TeacherAttendanceSelectionPage = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <SectionTitle>Teacher Attendance Management</SectionTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div 
                    onClick={() => setCurrentPage('teacher-my-attendance')}
                    className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                        isDarkMode 
                            ? 'bg-gray-800 border-blue-400 hover:border-blue-300' 
                            : 'bg-white border-blue-200 hover:border-blue-400'
                    }`}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className={`text-2xl font-bold mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>My Attendance</h3>
                        <p className={`${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>View and manage your own attendance records</p>
                    </div>
                </div>
                
                <div 
                    onClick={() => setCurrentPage('teacher-batch-attendance')}
                    className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                        isDarkMode 
                            ? 'bg-gray-800 border-green-400 hover:border-green-300' 
                            : 'bg-white border-green-200 hover:border-green-400'
                    }`}
                >
                    <div className="text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className={`text-2xl font-bold mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>Batch Attendance</h3>
                        <p className={`${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>Mark and manage student attendance for your batches</p>
                    </div>
                </div>
            </div>
            
            <BackToHomeButton />
        </div>
    );
};

// Teacher My Attendance Page
const TeacherMyAttendancePage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        setError('');

        if (!currentUser || !currentUser.token) {
            setError('User not authenticated.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/attendance/attendance/my/', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                const errorText = contentType && contentType.includes('application/json')
                    ? (await response.json()).detail || (await response.json()).message || 'Failed to fetch attendance'
                    : await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            setAttendanceData(data);
        } catch (err) {
            setError(`Failed to load attendance data: ${err.message}`);
            console.error('Fetch error (Teacher My Attendance):', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const renderAttendanceTable = () => {
        if (loading) return <div className="text-center py-4">Loading attendance...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (attendanceData.length === 0) return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No attendance records found.</div>;

        return (
            <div className={`overflow-x-auto rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Subject</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Batch</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        {attendanceData.map((record) => (
                            <tr key={record.id || `${record.date}-${record.subject}-${record.student?.id}`} className={`${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.date}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.subject}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.batch || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>My Attendance Log</SectionTitle>
            {renderAttendanceTable()}
            <BackToHomeButton />
        </div>
    );
};

// Teacher Batch Attendance Page
const TeacherBatchAttendancePage = () => {
    const { currentUser } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceSubject, setAttendanceSubject] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBatches = useCallback(async () => {
        if (!currentUser?.token) return;
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/timetable/batches/', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
                if (data.length > 0 && !selectedBatchId) {
                    setSelectedBatchId(data[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        }
    }, [currentUser, selectedBatchId]);

    const fetchStudentsForBatch = useCallback(async () => {
        if (!selectedBatchId || !currentUser?.token) return;
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/list/?role=student&batch=${selectedBatchId}`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to fetch students for batch:', err);
        }
    }, [selectedBatchId, currentUser]);

    const fetchAttendanceForBatch = useCallback(async () => {
        if (!selectedBatchId || !currentUser?.token) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/attendance/attendance/batch/${selectedBatchId}/`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                const errorText = contentType && contentType.includes('application/json')
                    ? (await response.json()).detail || (await response.json()).message || 'Failed to fetch attendance'
                    : await response.text();
                throw new Error(errorText);
            }
            
            const data = await response.json();
            setAttendanceData(data);
        } catch (err) {
            setError(`Failed to load attendance data: ${err.message}`);
            console.error('Fetch error (Batch Attendance):', err);
        } finally {
            setLoading(false);
        }
    }, [selectedBatchId, currentUser]);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    useEffect(() => {
        if (selectedBatchId) {
            fetchStudentsForBatch();
            fetchAttendanceForBatch();
        }
    }, [selectedBatchId, fetchStudentsForBatch, fetchAttendanceForBatch]);

    const handleMarkAttendance = async () => {
        if (!selectedStudents.length || !attendanceDate || !attendanceSubject) {
            window.alert('Please select students, date, and subject');
            return;
        }

        try {
            const attendancePromises = selectedStudents.map(async (studentId) => {
                const attendanceData = {
                    student: studentId,
                    date: attendanceDate,
                    subject: attendanceSubject,
                    status: 'Present',
                    marked_by: currentUser.id
                };

                const response = await fetch('http://127.0.0.1:8000/api/attendance/teacher/bulk-mark/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`
                    },
                    body: JSON.stringify(attendanceData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to mark attendance');
                }

                return response.json();
            });

            await Promise.all(attendancePromises);
            window.alert('Attendance marked successfully for all selected students!');
            
            setSelectedStudents([]);
            setAttendanceDate('');
            setAttendanceSubject('');
            
            fetchAttendanceForBatch();
        } catch (err) {
            window.alert(`Error marking attendance: ${err.message}`);
        }
    };

    const renderAttendanceTable = () => {
        if (loading) return <div className="text-center py-4">Loading attendance...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (attendanceData.length === 0) return <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No attendance records found for this batch.</div>;

        return (
            <div className={`overflow-x-auto rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Student</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Subject</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Marked By</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>Confirmed</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        {attendanceData.map((record) => (
                            <tr key={record.id} className={`${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.student?.username || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.subject}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.date}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.marked_by?.username || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{record.is_confirmed ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>Batch Attendance Management</SectionTitle>
            
            {/* Batch Selection */}
            <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Select Batch:</label>
                <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a batch</option>
                    {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            {selectedBatchId && (
                <>
                    {/* Student Selection */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-gray-700">Select Students:</label>
                        <div className="max-h-40 overflow-y-auto border rounded p-3 bg-gray-50">
                            {students.map(student => (
                                <label key={student.id} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedStudents([...selectedStudents, student.id]);
                                            } else {
                                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    {student.username} ({student.first_name} {student.last_name})
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Date:</label>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Subject:</label>
                            <input
                                type="text"
                                value={attendanceSubject}
                                onChange={(e) => setAttendanceSubject(e.target.value)}
                                placeholder="Enter subject name"
                                className="border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Mark Attendance Button */}
                    <button
                        onClick={handleMarkAttendance}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium mb-6"
                    >
                        Mark Attendance for Selected Students
                    </button>

                    {/* Current Attendance Records */}
                    <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-4">Current Attendance Records</h4>
                        {renderAttendanceTable()}
                    </div>
                </>
            )}
            
            <BackToHomeButton />
        </div>
    );
};

// Back to Home Button (fixed bottom left)
const BackToHomeButton = () => {
    const { setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <div className="mt-8 text-center">
            <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-6 py-3 rounded-lg shadow-lg transition duration-300 border ${
                    isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white border-gray-500'
                }`}
            >
                ← Back to Dashboard
            </button>
        </div>
    );
};

// MAMC Logo Component
const MAMCLogo = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <div className="flex items-center justify-center space-x-6">
            <div className="flex-shrink-0">
                <img 
                    src="/images/mamc-logo.png" 
                    alt="Maharaja Agrasen Medical College Logo"
                    className="w-24 h-24 object-contain rounded-lg shadow-xl"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        // Fallback to text-based logo if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                />
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-4 border-blue-300 shadow-xl hidden">
                    <div className="text-white text-3xl font-bold">M</div>
                </div>
            </div>
            <div className="text-center">
                <h1 className={`text-3xl font-bold tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>MAHARAJA AGRASEN MEDICAL COLLEGE</h1>
                <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-blue-200' : 'text-blue-600'
                }`}>AGROHA, HISAR</p>
                <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-red-200' : 'text-red-600'
                }`}>Affiliated to PT. BDS University of Health & Social Sciences, Rohtak</p>
            </div>
        </div>
    );
};

// Small MAMC Logo Component for headers (currently unused but available for future use)
// eslint-disable-next-line no-unused-vars
const MAMCLogoSmall = () => {
    const { isDarkMode } = useContext(ThemeContext);
    return (
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
                <img 
                    src="/images/mamc-logo.png" 
                    alt="MAMC Logo"
                    className="w-12 h-12 object-contain rounded-lg"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        // Fallback to text-based logo if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-blue-400 hidden">
                    <div className="text-white text-lg font-bold">M</div>
                </div>
            </div>
            <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MAMC</h2>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Management System</p>
            </div>
        </div>
    );
};

// Hidden Superuser Components
const HiddenSuperuserDashboard = () => {
    // eslint-disable-next-line no-unused-vars
    const { currentUser, setCurrentPage } = useContext(AppContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                console.log('Fetching dashboard with token:', token ? 'Token exists' : 'No token');
                
                        const response = await apiCall('http://127.0.0.1:8000/api/hidden-superuser/dashboard/');
                
                console.log('Dashboard response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Dashboard error response:', errorText);
                    throw new Error(`Failed to fetch dashboard data: ${response.status} ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Dashboard data received:', data);
                setDashboardData(data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className={`mt-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Loading Hidden Superuser Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <p className={`mb-4 ${
                        isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className={`p-4 ${
                isDarkMode ? 'bg-red-800 text-white' : 'bg-red-600 text-white'
            }`}>
                <div className="max-w-7xl mx-auto">
                    <MAMCLogo />
                    <div className="mt-2 text-center">
                        <h2 className={`text-xl font-semibold ${
                            isDarkMode ? 'text-red-200' : 'text-red-100'
                        }`}>🔒 Hidden Superuser Dashboard</h2>
                        <p className={`text-sm ${
                            isDarkMode ? 'text-red-100' : 'text-red-200'
                        }`}>Complete system monitoring and control panel</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* System Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className={`p-4 rounded-lg shadow border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    }`}>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Total Users</h3>
                        <p className="text-3xl font-bold text-blue-400">{dashboardData?.total_users || 0}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    }`}>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Active Sessions</h3>
                        <p className="text-3xl font-bold text-green-400">{dashboardData?.active_sessions || 0}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    }`}>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Admins</h3>
                        <p className="text-3xl font-bold text-purple-400">{dashboardData?.total_admins || 0}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    }`}>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Principals</h3>
                        <p className="text-3xl font-bold text-orange-400">{dashboardData?.total_principals || 0}</p>
                    </div>
                </div>

                {/* System Health */}
                <div className={`p-6 rounded-lg shadow mb-8 border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>System Health</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Database</p>
                            <p className="text-lg font-semibold text-green-400">Connected</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Disk Usage</p>
                            <p className="text-lg font-semibold text-blue-400">{dashboardData?.system_health?.disk_usage || 'Unknown'}</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Memory Usage</p>
                            <p className="text-lg font-semibold text-blue-400">{dashboardData?.system_health?.memory_usage || 'Unknown'}</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Uptime</p>
                            <p className="text-lg font-semibold text-green-400">{dashboardData?.system_health?.uptime || 'Unknown'}</p>
                        </div>
                    </div>
                </div>

                {/* Admin Functions Overview */}
                <div className={`p-6 rounded-lg shadow mb-8 border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>🔧 Admin Functions Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">User Management</h3>
                            <ul className={`text-sm space-y-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <li>• Create new users</li>
                                <li>• Manage student/faculty info</li>
                                <li>• Assign hidden superuser status</li>
                                <li>• Export user data</li>
                            </ul>
                        </div>
                        <div className={`p-4 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <h3 className="text-lg font-semibold text-green-400 mb-2">Academic Management</h3>
                            <ul className={`text-sm space-y-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <li>• Attendance tracking</li>
                                <li>• Grade management</li>
                                <li>• Leave approval</li>
                                <li>• Timetable management</li>
                            </ul>
                        </div>
                        <div className={`p-4 rounded-lg ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <h3 className="text-lg font-semibold text-purple-400 mb-2">System Control</h3>
                            <ul className={`text-sm space-y-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <li>• Code modification</li>
                                <li>• Payment management</li>
                                <li>• Library management</li>
                                <li>• Campus monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={`p-6 rounded-lg shadow ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <h2 className={`text-2xl font-bold mb-4 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Recent Activities</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {dashboardData?.recent_activities?.map((activity, index) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <p className={`font-semibold text-sm ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{activity.user_username} ({activity.user_role})</p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.action} - {activity.model_name}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-6 rounded-lg shadow ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <h2 className={`text-2xl font-bold mb-4 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Recent Logins</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {dashboardData?.recent_logins?.map((login, index) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                    <p className={`font-semibold text-sm ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{login.user_username} ({login.user_role})</p>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Login: {new Date(login.login_time).toLocaleString()}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Duration: {login.session_duration_formatted}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Events */}
                <div className={`p-6 rounded-lg shadow mt-8 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>System Events</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {dashboardData?.system_events?.map((event, index) => (
                            <div key={index} className={`border-l-4 pl-4 py-2 ${
                                event.severity === 'critical' ? 'border-red-500' :
                                event.severity === 'high' ? 'border-orange-500' :
                                event.severity === 'medium' ? 'border-yellow-500' :
                                'border-green-500'
                            }`}>
                                <p className="font-semibold text-sm">{event.event_type}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.description}</p>
                                <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Modifications */}
                <div className="bg-white p-6 rounded-lg shadow mt-8">
                    <h2 className="text-2xl font-bold mb-4">Recent Code Modifications</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {dashboardData?.code_modifications?.map((mod, index) => (
                            <div key={index} className={`border-l-4 pl-4 py-2 ${
                                mod.is_applied ? 'border-green-500' : 'border-red-500'
                            }`}>
                                <p className="font-semibold text-sm">{mod.modified_by_username}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{mod.file_path} - {mod.modification_type}</p>
                                <p className="text-xs text-gray-500">{new Date(mod.timestamp).toLocaleString()}</p>
                                {mod.error_message && (
                                    <p className="text-xs text-red-500">Error: {mod.error_message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setCurrentPage('hidden-superuser-user-management')}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-purple-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">👥</div>
                            <h3 className="text-lg font-semibold">User Management</h3>
                            <p className="text-sm opacity-90">Manage all users and hidden superuser status</p>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => setCurrentPage('hidden-superuser-code-editor')}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-orange-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">💻</div>
                            <h3 className="text-lg font-semibold">Code Editor</h3>
                            <p className="text-sm opacity-90">Direct code modification for frontend and backend</p>
                        </div>
                    </button>

                    {/* Admin Functions */}
                    <button
                        onClick={() => setCurrentPage('students-faculty-info')}
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-green-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">👨‍🎓</div>
                            <h3 className="text-lg font-semibold">Student & Faculty</h3>
                            <p className="text-sm opacity-90">Manage students, faculty, and batches</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('create-user')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-indigo-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">➕</div>
                            <h3 className="text-lg font-semibold">Create Users</h3>
                            <p className="text-sm opacity-90">Add new users and batches</p>
                        </div>
                    </button>
                </div>

                {/* Additional Admin Functions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setCurrentPage('attendance')}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-blue-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="text-lg font-semibold">Attendance</h3>
                            <p className="text-sm opacity-90">View and manage attendance records</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('grades')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-yellow-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📝</div>
                            <h3 className="text-lg font-semibold">Grades</h3>
                            <p className="text-sm opacity-90">Manage grades and academic records</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('payments')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-emerald-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">💰</div>
                            <h3 className="text-lg font-semibold">Payments</h3>
                            <p className="text-sm opacity-90">Manage payments and financial records</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('leaves')}
                        className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-pink-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📋</div>
                            <h3 className="text-lg font-semibold">Leave Management</h3>
                            <p className="text-sm opacity-90">Approve and manage leave requests</p>
                        </div>
                    </button>
                </div>

                {/* System Management Functions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setCurrentPage('library')}
                        className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-teal-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📚</div>
                            <h3 className="text-lg font-semibold">Library</h3>
                            <p className="text-sm opacity-90">Manage library books and borrowing</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('timetable')}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-cyan-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📅</div>
                            <h3 className="text-lg font-semibold">Timetable</h3>
                            <p className="text-sm opacity-90">Manage class schedules and timetables</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('college-in-out-log')}
                        className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-violet-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">🏫</div>
                            <h3 className="text-lg font-semibold">College Logs</h3>
                            <p className="text-sm opacity-90">Monitor college entry/exit logs</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('hostel-attendance')}
                        className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-amber-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">🏠</div>
                            <h3 className="text-lg font-semibold">Hostel</h3>
                            <p className="text-sm opacity-90">Monitor hostel attendance logs</p>
                        </div>
                    </button>
                </div>

                {/* Teacher Management Functions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setCurrentPage('teacher-attendance-selection')}
                        className="bg-lime-600 hover:bg-lime-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-lime-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">👨‍🏫</div>
                            <h3 className="text-lg font-semibold">Teacher Attendance</h3>
                            <p className="text-sm opacity-90">Manage teacher attendance selection</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('teacher-my-attendance')}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-rose-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">📈</div>
                            <h3 className="text-lg font-semibold">My Attendance</h3>
                            <p className="text-sm opacity-90">View personal attendance records</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('teacher-batch-attendance')}
                        className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-sky-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">👥</div>
                            <h3 className="text-lg font-semibold">Batch Attendance</h3>
                            <p className="text-sm opacity-90">Mark attendance for entire batches</p>
                        </div>
                    </button>
                </div>

                {/* System Control Functions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-gray-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">🔄</div>
                            <h3 className="text-lg font-semibold">Refresh Dashboard</h3>
                            <p className="text-sm opacity-90">Reload dashboard data</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentPage('my-info-corner')}
                        className="bg-slate-600 hover:bg-slate-700 text-white p-4 rounded-lg shadow-lg transition duration-300 border border-slate-500"
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">ℹ️</div>
                            <h3 className="text-lg font-semibold">My Info Corner</h3>
                            <p className="text-sm opacity-90">View personal information and settings</p>
                        </div>
                    </button>
                </div>

                <BackToHomeButton />
            </div>
        </div>
    );
};

const HiddenSuperuserUserManagement = () => {
    const { isDarkMode } = useContext(ThemeContext);
    // eslint-disable-next-line no-unused-vars
    const { currentUser } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/user-management/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                
                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleHiddenSuperuser = async (userId) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/user-management/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'toggle_hidden_superuser',
                    user_id: userId,
                }),
            });

            if (response.ok) {
                // Refresh user list
                window.location.reload();
            }
        } catch (err) {
            console.error('Error toggling hidden superuser:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-red-800 text-white p-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold">👥 User Management</h1>
                    <p className="text-red-200">Manage all users and hidden superuser status</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'principal' ? 'bg-orange-100 text-orange-800' :
                                                user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'student' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.activity_count} activities
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => toggleHiddenSuperuser(user.id)}
                                                className={`px-3 py-1 text-xs rounded-full ${
                                                    user.is_hidden_superuser 
                                                        ? 'bg-red-600 text-white hover:bg-red-700' 
                                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                                }`}
                                            >
                                                {user.is_hidden_superuser ? 'Remove Hidden Superuser' : 'Make Hidden Superuser'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <BackToHomeButton />
            </div>
        </div>
    );
};

const HiddenSuperuserCodeEditor = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const { currentUser } = useContext(AppContext);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [fileType, setFileType] = useState('frontend');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [showCreateFile, setShowCreateFile] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [deploymentStatus, setDeploymentStatus] = useState(null);
    const [showDeploymentStatus, setShowDeploymentStatus] = useState(false);

    const fetchFiles = useCallback(async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/hidden-superuser/code-modifications/list_files/?file_type=${fileType}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFiles(data.files);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    }, [fileType]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const fetchDeploymentStatus = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/code-modifications/deployment_status/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDeploymentStatus(data);
            }
        } catch (error) {
            console.error('Error fetching deployment status:', error);
        }
    };

    const fetchFileContent = async (filePath) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/hidden-superuser/code-modifications/get_file_content/?file_path=${encodeURIComponent(filePath)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFileContent(data.content);
                setSelectedFile(filePath);
            }
        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    };

    const saveFile = async () => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/code-modifications/modify_code/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_path: selectedFile,
                    file_type: fileType,
                    modification_type: 'update',
                    new_content: fileContent,
                    description: `Code modified by hidden superuser ${currentUser.username}`,
                    backup_existing: true,
                }),
            });

            if (response.ok) {
                setMessage('File saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.error || 'Failed to save file'}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const createNewFile = async () => {
        if (!newFileName) return;

        setLoading(true);
        try {
            const filePath = `../med_frontend/src/${newFileName}`;
            const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/code-modifications/modify_code/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_path: filePath,
                    file_type: fileType,
                    modification_type: 'create',
                    new_content: '// New file created by hidden superuser\n',
                    description: `New file created by hidden superuser ${currentUser.username}`,
                    backup_existing: false,
                }),
            });

            if (response.ok) {
                setMessage('New file created successfully!');
                setNewFileName('');
                setShowCreateFile(false);
                fetchFiles(); // Refresh file list
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.error || 'Failed to create file'}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deployChanges = async () => {
        setDeploying(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/hidden-superuser/code-modifications/deploy_changes/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`🚀 Deployment completed successfully! Modified ${data.modified_files_count} files.`);
                setTimeout(() => setMessage(''), 8000);
            } else {
                const errorData = await response.json();
                setMessage(`❌ Deployment failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            setMessage(`❌ Deployment error: ${error.message}`);
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="bg-red-800 text-white p-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold">💻 Code Editor</h1>
                    <p className="text-red-200">Direct code modification for frontend and backend - Changes apply to all devices</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Code Editor</h2>
                            <div className="flex items-center gap-3">
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white"
                                >
                                    <option value="frontend">Frontend Files</option>
                                    <option value="backend">Backend Files</option>
                                    <option value="config">Config Files</option>
                                </select>
                                <button
                                    onClick={deployChanges}
                                    disabled={deploying}
                                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 border border-purple-500"
                                >
                                    {deploying ? 'Deploying...' : '🚀 Deploy Changes'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeploymentStatus(!showDeploymentStatus);
                                        if (!deploymentStatus) fetchDeploymentStatus();
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 border border-blue-500"
                                >
                                    📊 Deployment Status
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded mb-4 ${
                                message.includes('Error') ? 'bg-red-900 text-red-200 border border-red-600' : 'bg-green-900 text-green-200 border border-green-600'
                            }`}>
                                {message}
                            </div>
                        )}

                        {showDeploymentStatus && deploymentStatus && (
                            <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800">
                                <h3 className="text-lg font-semibold text-white mb-3">📊 Deployment Status</h3>
                                
                                {/* System Health */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-700 rounded">
                                        <div className="text-2xl">🟢</div>
                                        <div className="text-sm text-gray-300">Backend</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700 rounded">
                                        <div className="text-2xl">🟢</div>
                                        <div className="text-sm text-gray-300">Frontend</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700 rounded">
                                        <div className="text-2xl">🟢</div>
                                        <div className="text-sm text-gray-300">Database</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700 rounded">
                                        <div className="text-sm text-gray-300">
                                            {deploymentStatus.system_health?.pending_changes || 0} Changes
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Deployments */}
                                {deploymentStatus.recent_deployments && deploymentStatus.recent_deployments.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-md font-semibold text-white mb-2">Recent Deployments</h4>
                                        <div className="space-y-2">
                                            {deploymentStatus.recent_deployments.slice(0, 3).map((deployment, index) => (
                                                <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                                                    <div className="text-white">
                                                        {new Date(deployment.timestamp).toLocaleString()}
                                                    </div>
                                                    <div className="text-gray-400">
                                                        {deployment.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pending Modifications */}
                                {deploymentStatus.pending_modifications && deploymentStatus.pending_modifications.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-white mb-2">Pending Changes</h4>
                                        <div className="space-y-1">
                                            {deploymentStatus.pending_modifications.slice(0, 5).map((mod, index) => (
                                                <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                                                    <div className="text-white">
                                                        {mod.file_path.split('/').pop()}
                                                    </div>
                                                    <div className="text-gray-400">
                                                        {mod.modification_type} - {mod.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* File List */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white">Files</h3>
                                    <button
                                        onClick={() => setShowCreateFile(!showCreateFile)}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 border border-green-500"
                                    >
                                        + New File
                                    </button>
                                </div>
                                
                                {showCreateFile && (
                                    <div className="mb-4 p-3 border border-gray-600 rounded-lg bg-gray-700">
                                        <input
                                            type="text"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            placeholder="Enter filename (e.g., NewComponent.js)"
                                            className="w-full p-2 border border-gray-600 rounded mb-2 bg-gray-600 text-white"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={createNewFile}
                                                disabled={loading || !newFileName}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 border border-green-500"
                                            >
                                                Create
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowCreateFile(false);
                                                    setNewFileName('');
                                                }}
                                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 border border-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="border border-gray-600 rounded-lg max-h-96 overflow-y-auto bg-gray-700">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            onClick={() => fetchFileContent(file.path)}
                                            className={`p-3 border-b border-gray-600 cursor-pointer hover:bg-gray-600 text-white ${
                                                selectedFile === file.path ? 'bg-blue-600 border-blue-400' : ''
                                            }`}
                                        >
                                            <div className="font-medium text-sm">{file.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {Math.round(file.size / 1024)}KB • {new Date(file.modified).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white">
                                        {selectedFile ? selectedFile.split('/').pop() : 'Select a file'}
                                    </h3>
                                    {selectedFile && (
                                        <button
                                            onClick={saveFile}
                                            disabled={loading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 border border-blue-500"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={fileContent}
                                    onChange={(e) => setFileContent(e.target.value)}
                                    className="w-full h-96 p-4 border border-gray-600 rounded-lg font-mono text-sm bg-gray-700 text-white"
                                    placeholder="Select a file to edit..."
                                    readOnly={!selectedFile}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <BackToHomeButton />
            </div>
        </div>
    );
};

// Add token refresh utility at the top of the file, after imports
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        return false;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/users/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
    
    return false;
};

const getAuthHeaders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return {};
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
                return { Authorization: `Bearer ${localStorage.getItem('access_token')}` };
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
                return {};
            }
        }
        
        return { Authorization: `Bearer ${token}` };
    } catch (error) {
        console.error('Auth check failed:', error);
        return {};
    }
};

// Centralized API call function with error handling
const apiCall = async (url, options = {}) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
                ...options.headers,
            },
        });
        
        if (response.status === 401) {
            // Token expired, try to refresh
            const refreshed = await refreshToken();
            if (refreshed) {
                // Retry the request with new token
                const newHeaders = await getAuthHeaders();
                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...newHeaders,
                        ...options.headers,
                    },
                });
                return retryResponse;
            } else {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
                return null;
            }
        }
        
        return response;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// Global error handler
// eslint-disable-next-line no-unused-vars
const handleApiError = (error, context = '') => {
    console.error(`API Error in ${context}:`, error);
    
    if (error.message?.includes('Failed to fetch')) {
        return {
            type: 'error',
            message: 'Unable to connect to server. Please check your internet connection and try again.'
        };
    }
    
    if (error.status === 401) {
        return {
            type: 'error',
            message: 'Session expired. Please log in again.'
        };
    }
    
    if (error.status === 403) {
        return {
            type: 'error',
            message: 'You do not have permission to perform this action.'
        };
    }
    
    if (error.status === 404) {
        return {
            type: 'error',
            message: 'The requested resource was not found.'
        };
    }
    
    if (error.status >= 500) {
        return {
            type: 'error',
            message: 'Server error. Please try again later.'
        };
    }
    
    return {
        type: 'error',
        message: error.message || 'An unexpected error occurred.'
    };
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('login');
    const { isDarkMode } = useContext(ThemeContext);
    
    const renderContent = () => {
        if (!currentUser) {
            return <LoginPage setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
        }

        switch (currentPage) {
            case 'login':
                return <LoginPage setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
            case 'dashboard':
                // Check if user is hidden superuser
                console.log('Dashboard routing - User:', currentUser);
                console.log('is_hidden_superuser:', currentUser.is_hidden_superuser);
                if (currentUser.is_hidden_superuser) {
                    console.log('Routing to HiddenSuperuserDashboard');
                    return <HiddenSuperuserDashboard />;
                }
                switch (currentUser.role) {
                    case 'student':
                        return <StudentDashboard />;
                    case 'parent':
                        return <ParentDashboard />;
                    case 'teacher':
                        return <TeacherDashboard />;
                    case 'admin':
                    case 'principal':
                        return <AdminDashboard />;
                    default:
                        console.warn(`Unknown role dashboard for role: ${currentUser.role}. Displaying generic message.`);
                        return <div className={`text-center py-10 text-xl font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Unknown role dashboard. Please contact support.</div>;
                }
            case 'attendance':
                return <AttendancePage />;
            case 'grades':
                return <GradesPage />;
            case 'leaves':
                return <LeavesPage />;
            case 'library':
                return <LibraryPage />;
            case 'library-management':
                return <LibraryManagementPage />;
            case 'payments':
                return <PaymentsPage />;
            case 'timetable':
                return <TimetablePage />;
            case 'myinfo':
                return <MyInfoCornerPage />;
            case 'college-in-out-log':
                return <CollegeInOutLogPage />;
            case 'hostel-attendance':
                return <HostelAttendancePage />;
            case 'students-faculty-info':
                return <StudentsFacultyInfoPage />;
            case 'create-user':
                return <CreateUserPage />;
            case 'teacher-attendance-selection':
                return <TeacherAttendanceSelectionPage />;
            case 'teacher-my-attendance':
                return <TeacherMyAttendancePage />;
            case 'teacher-batch-attendance':
                return <TeacherBatchAttendancePage />;
            case 'hidden-superuser-user-management':
                return <HiddenSuperuserUserManagement />;
            case 'hidden-superuser-code-editor':
                return <HiddenSuperuserCodeEditor />;
            case 'my-info-corner':
                return <MyInfoCornerPage />;
            default:
                return <div className={`text-center py-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Page Not Found.</div>;
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-50 text-gray-900'
        }`}>
            <AppContext.Provider value={{ currentUser, setCurrentUser, currentPage, setCurrentPage }}>
                <BulletinBoardProvider>
                    {renderContent()}
                    <ThemeToggle />
                </BulletinBoardProvider>
            </AppContext.Provider>
        </div>
    );
};

const AppWithTheme = () => {
    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    );
};

export default AppWithTheme;
