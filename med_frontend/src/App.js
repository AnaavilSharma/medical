import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';

// AppContext for global state management (currentUser, currentPage)
export const AppContext = createContext(null);

// Reusable Section Title Component
const SectionTitle = ({ children }) => (
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{children}</h3>
);

// Reusable Feature Card Component for Dashboards
const FeatureCard = ({ title, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
        <span className="text-4xl mb-2">{title[0]}</span> {/* Displays first letter of title as a large icon */}
        <p className="text-lg font-medium text-gray-700">{title}</p>
    </button>
);

// Layout for all Dashboard pages, including Header and Navigation
const DashboardLayout = ({ children, title }) => {
    const { currentUser, setCurrentPage, setCurrentUser, currentPage } = useContext(AppContext);

    // Determines navigation items based on user role
    const getNavItems = (role) => {
        switch (role) {
            case 'student':
                return [
                    { name: 'Attendance', page: 'attendance' },
                    { name: 'Grades', page: 'grades' },
                    { name: 'Leaves', page: 'leaves' },
                    { name: 'Library', page: 'library' },
                    { name: 'Payments', page: 'payments' },
                    { name: 'Timetable', page: 'timetable' },
                    { name: 'My Info Corner', page: 'myinfo' },
                ];
            case 'parent':
                return [
                    { name: 'Attendance', page: 'attendance' },
                    { name: 'Grades', page: 'grades' },
                    { name: 'Leaves', page: 'leaves' },
                    { name: 'Library', page: 'library' },
                    { name: 'Payments', page: 'payments' },
                    { name: 'Timetable', page: 'timetable' },
                    { name: 'My Info Corner', page: 'myinfo' },
                ];
            case 'teacher':
                return [
                    { name: 'Attendance', page: 'attendance' },
                    { name: 'Grades', page: 'grades' },
                    { name: 'Leaves', page: 'leaves' },
                    { name: 'Library', page: 'library' },
                    { name: 'Timetable', page: 'timetable' },
                    { name: 'My Info Corner', page: 'myinfo' },
                ];
            case 'admin':
            case 'principal':
                return [
                    { name: 'Attendance', page: 'attendance' },
                    { name: 'College In/Out Log', page: 'college-logs' },
                    { name: 'Grades', page: 'grades' },
                    { name: 'Hostel Attendance', page: 'hostel-attendance' },
                    { name: 'Leaves', page: 'leaves' },
                    { name: 'Library', page: 'library' },
                    { name: 'Payments', page: 'payments' },
                    { name: 'Timetable', page: 'timetable' },
                    { name: 'Students & Faculty Info', page: 'users-info' },
                    { name: 'My Info Corner', page: 'myinfo' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems(currentUser?.role);

    // Handles user logout, clearing current user and returning to login page
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentPage('login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Section */}
            <header className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center">
                <h1 className="text-2xl font-bold">MAMC Portal - {title}</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-lg">Welcome, {currentUser?.username || 'User'} ({currentUser?.role})</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-grow">
                {/* Navigation Sidebar */}
                <nav className="w-64 bg-white shadow-lg p-6 flex flex-col space-y-4">
                    {navItems.map((item) => (
                        <button
                            key={item.page}
                            onClick={() => setCurrentPage(item.page)}
                            className={`w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition duration-200 text-lg ${
                                currentPage === item.page ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <main className="flex-grow p-8 bg-gray-50 overflow-auto">
                    {/* Back to Dashboard Button (conditionally rendered) */}
                    {currentPage !== 'dashboard' && currentPage !== 'login' && (
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className="mb-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg shadow-sm transition duration-200 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Dashboard
                        </button>
                    )}
                    {children} {/* Renders the specific page content */}
                </main>
            </div>
        </div>
    );
};

// --- Dashboard Components (Role-specific) ---
const StudentDashboard = () => {
    const { setCurrentPage } = useContext(AppContext);
    return (
        <DashboardLayout title="Student Dashboard">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Home</h2>
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
    return (
        <DashboardLayout title="Parent Dashboard">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Parent Home</h2>
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
    return (
        <DashboardLayout title="Teacher Dashboard">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Teacher Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('attendance')} />
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
    return (
        <DashboardLayout title="Admin/Principal Dashboard">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin/Principal Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard title="Attendance" onClick={() => setCurrentPage('attendance')} />
                <FeatureCard title="College In/Out Log" onClick={() => setCurrentPage('college-logs')} />
                <FeatureCard title="Grades" onClick={() => setCurrentPage('grades')} />
                <FeatureCard title="Hostel Attendance" onClick={() => setCurrentPage('hostel-attendance')} />
                <FeatureCard title="Leaves" onClick={() => setCurrentPage('leaves')} />
                <FeatureCard title="Library" onClick={() => setCurrentPage('library')} />
                <FeatureCard title="Payments" onClick={() => setCurrentPage('payments')} />
                <FeatureCard title="Timetable" onClick={() => setCurrentPage('timetable')} />
                <FeatureCard title="Students & Faculty Info" onClick={() => setCurrentPage('users-info')} />
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

    if (loading) return <div className="text-center py-8">Loading your information...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>My Info Corner</SectionTitle>
            {userInfo ? (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
                    <p className="mb-2"><strong className="text-gray-700">Username:</strong> {userInfo.username}</p>
                    <p className="mb-2"><strong className="text-gray-700">Role:</strong> {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}</p>
                    <p className="mb-2"><strong className="text-gray-700">Full Name:</strong> {userInfo.full_name || 'N/A'}</p>
                    <p className="mb-2"><strong className="text-gray-700">Email:</strong> {userInfo.email || 'N/A'}</p>
                    {userInfo.student_id && <p className="mb-2"><strong className="text-gray-700">Student ID:</strong> {userInfo.student_id}</p>}
                    {/* Assuming batch_name is returned for display, not just batch ID */}
                    {userInfo.batch_name && <p className="mb-2"><strong className="text-gray-700">Batch:</strong> {userInfo.batch_name}</p>}
                    {userInfo.faculty_id && <p className="mb-2"><strong className="text-gray-700">Faculty ID:</strong> {userInfo.faculty_id}</p>}
                    {userInfo.department && <p className="mb-2"><strong className="text-gray-700">Department:</strong> {userInfo.department}</p>}
                    {userInfo.child_name && <p className="mb-2"><strong className="text-gray-700">Child's Name:</strong> {userInfo.child_name}</p>}
                    {userInfo.admin_level && <p className="mb-2"><strong className="text-gray-700">Admin Level:</strong> {userInfo.admin_level}</p>}
                    <p><strong className="text-gray-700">Date Joined:</strong> {userInfo.date_joined || 'N/A'}</p>
                </div>
            ) : (
                <p className="text-center text-gray-600">No user information available.</p>
            )}
        </div>
    );
};

// Attendance Page
const AttendancePage = () => {
    const { currentUser } = useContext(AppContext);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');

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

            // ✅ FIXED URLS BELOW
            if (currentUser.role === 'student') {
                url = `http://127.0.0.1:8000/api/attendance/my/`;
            } else if (currentUser.role === 'parent') {
                url = `http://127.0.0.1:8000/api/attendance/parent/student/attendance/`;
            } else if (currentUser.role === 'teacher') {
                if (selectedBatchId) {
                    url = `http://127.0.0.1:8000/api/attendance/attendance/batch/${selectedBatchId}/`;
                } else {
                    setAttendanceData([]);
                    setLoading(false);
                    return;
                }
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

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const renderAttendanceTable = () => {
        if (loading) return <div className="text-center py-4">Loading attendance...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (attendanceData.length === 0) return <div className="text-center py-4 text-gray-600">No attendance records found.</div>;

        const studentParentTable = (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Subject</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Batch</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((record) => (
                            <tr key={record.id || `${record.date}-${record.subject}-${record.student?.id}`}>
                                <td className="px-4 py-2">{record.date}</td>
                                <td className="px-4 py-2">{record.subject}</td>
                                <td className={`px-4 py-2 font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className="px-4 py-2">{record.batch || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const adminTeacherTable = (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2">Student</th>
                            <th className="px-4 py-2">Batch</th>
                            <th className="px-4 py-2">Subject</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Marked By</th>
                            <th className="px-4 py-2">Confirmed</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((record) => (
                            <tr key={record.id}>
                                <td className="px-4 py-2">{record.student?.username || 'N/A'}</td>
                                <td className="px-4 py-2">{record.batch || 'N/A'}</td>
                                <td className="px-4 py-2">{record.subject}</td>
                                <td className="px-4 py-2">{record.date}</td>
                                <td className={`px-4 py-2 font-medium ${
                                    record.status === 'Present' ? 'text-green-600' :
                                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                                }`}>{record.status}</td>
                                <td className="px-4 py-2">{record.marked_by?.username || 'N/A'}</td>
                                <td className="px-4 py-2">{record.is_confirmed ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-2">
                                    <button className="text-blue-600 mr-2">Edit</button>
                                    <button className="text-red-600">Delete</button>
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
            case 'teacher':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block mb-1">Select Batch:</label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                className="border rounded w-full py-2 px-3"
                            >
                                <option value="">Select a batch</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedBatchId && adminTeacherTable}
                        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Mark New Attendance</button>
                    </>
                );
            case 'admin':
            case 'principal':
                return (
                    <>
                        <div className="mb-4 flex gap-4">
                            <div>
                                <label className="block mb-1">Batch Filter:</label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => { setSelectedBatchId(e.target.value); setSelectedStudentId(''); }}
                                    className="border rounded py-2 px-3"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1">Student ID:</label>
                                <input
                                    type="text"
                                    value={selectedStudentId}
                                    onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedBatchId(''); }}
                                    className="border rounded py-2 px-3"
                                    placeholder="Enter student ID"
                                />
                            </div>
                        </div>
                        {adminTeacherTable}
                        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Add Attendance Record</button>
                    </>
                );
            default:
                return <div className="text-center py-4 text-gray-600">No attendance view for this role.</div>;
        }
    };

    return (
        <div>
            <SectionTitle>Attendance</SectionTitle>
            {renderAttendanceTable()}
        </div>
    );
};
// Grades Page
const GradesPage = () => {
    const { currentUser } = useContext(AppContext);
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');

    // Fetches grades data based on user role and filters
    React.useEffect(() => {
        const fetchGrades = async () => {
            setLoading(true);
            setError('');
            let url = '';

            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for Grades.');
                setLoading(false);
                console.log('GradesPage: currentUser or token missing.', currentUser);
                return;
            }

            try {
                if (currentUser.role === 'student') {
                    url = `http://127.0.0.1:8000/api/grades/my/`;
                } else if (currentUser.role === 'parent') {
                    url = `http://127.0.0.1:8000/api/parent/student/grades/`;
                } else if (currentUser.role === 'teacher') {
                    if (selectedStudentId) {
                        url = `http://127.0.0.1:8000/api/grades/student/${selectedStudentId}/`;
                    } else {
                        url = `http://127.0.0.1:8000/api/grades/given/`; // Teacher's own given grades
                    }
                } else if (currentUser.role === 'admin' || currentUser.role === 'principal') {
                    if (selectedStudentId) {
                        url = `http://127.0.0.1:8000/api/grades/student/${selectedStudentId}/`;
                    } else {
                        url = `http://127.0.0.1:8000/api/grades/admin/list/`; // Admin/principal list all
                    }
                } else {
                    setError('Unauthorized access for grades.');
                    setLoading(false);
                    return;
                }

                console.log('GradesPage: Fetching grades from URL:', url);
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch grades data');
                }
                const data = await response.json();
                setGradesData(data);
                setLoading(false);
                console.log('GradesPage: Grades data fetched successfully.', data);

            } catch (err) {
                setError(`Failed to load grades data: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (Grades):', err);
            }
        };
        fetchGrades();
    }, [currentUser, selectedStudentId]);

    // Renders the grades table
    const renderGradesTable = () => {
        if (loading) return <div className="text-center py-4">Loading grades...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (gradesData.length === 0) return <div className="text-center py-4 text-gray-600">No grades records found.</div>;

        return (
            <div className="overflow-x-auto">
                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                    <div className="mb-4">
                        <label htmlFor="studentIdInput" className="block text-gray-700 text-sm font-bold mb-2">Filter by Student ID:</label>
                        <input
                            type="text"
                            id="studentIdInput"
                            placeholder="Enter Student ID"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                )}
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>}
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {gradesData.map((grade) => (
                            <tr key={grade.id || `${grade.subject}-${grade.student?.id || grade.student_id}`} className="border-b last:border-b-0 hover:bg-gray-50">
                                {/* Check if grade.student.username exists for nested student object, else fallback to studentName */}
                                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && <td className="px-4 py-3 whitespace-nowrap">{grade.student?.username || grade.student_name || 'N/A'}</td>}
                                <td className="px-4 py-3 whitespace-nowrap">{grade.subject}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{grade.marks}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{grade.grade}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{grade.remarks || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{grade.date_recorded}</td>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                        <button className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(currentUser.role === 'teacher' || currentUser.role === 'admin' || currentUser.role === 'principal') && (
                    <button className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-sm">Add Grade</button>
                )}
            </div>
        );
    };

    return (
        <div>
            <SectionTitle>Grades & Marks</SectionTitle>
            {renderGradesTable()}
        </div>
    );
};

// Leaves Page
const LeavesPage = () => {
    const { currentUser } = useContext(AppContext);
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
                {currentUser.role === 'student' && (
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

                <SectionTitle>{currentUser.role === 'student' ? 'My Leave Requests' : 'All Leave Requests'}</SectionTitle>
                {leavesData.length === 0 ? (
                    <div className="text-center py-4 text-gray-600">No leave requests found.</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {(currentUser.role !== 'student' && currentUser.role !== 'parent') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leavesData.map((leave) => (
                                    <tr key={leave.id || `${leave.start_date}-${leave.user?.id}`} className="border-b last:border-b-0 hover:bg-gray-50">
                                        {(currentUser.role !== 'student' && currentUser.role !== 'parent') && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {leave.user ? `${leave.user.username} (${leave.user.role})` : 'N/A'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">{leave.start_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{leave.end_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{leave.reason}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                                            leave.status === 'Approved' ? 'text-green-600' :
                                            leave.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>{leave.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(leave.applied_at).toLocaleDateString()}</td>
                                        {(currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher') && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {leave.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900 mr-2"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                            className="text-red-600 hover:text-red-900"
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
        </div>
    );
};

// Library Page
const LibraryPage = () => {
    const { currentUser } = useContext(AppContext);
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
            alert('Book borrowed successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Error borrowing book: ${err.message}`);
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
            alert('Book returned successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Error returning book: ${err.message}`);
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
            alert('Library entry marked successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Error marking entry: ${err.message}`);
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
            alert('Library exit marked successfully!');
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Error marking exit: ${err.message}`);
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
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Available Books</h4>
                {books.length === 0 ? (
                    <p className="text-gray-600">No books currently available.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Copies</th>
                                    {currentUser.role === 'student' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.genre || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{book.available_copies}</td> {/* Changed from 'available' */}
                                        {currentUser.role === 'student' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {book.available_copies > 0 ? (
                                                    <button onClick={() => handleBorrowBook(book.id)} className="text-blue-600 hover:text-blue-900">Borrow</button>
                                                ) : (
                                                    <span className="text-gray-500">Out of Stock</span>
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
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">My Borrowed Books</h4>
                        {borrowedBooks.length === 0 ? (
                            <p className="text-gray-600">You have not borrowed any books.</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {borrowedBooks.map((borrow) => (
                                            <tr key={borrow.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{borrow.book_title}</td> {/* Changed from bookTitle */}
                                                <td className="px-6 py-4 whitespace-nowrap">{borrow.borrow_date}</td> {/* Changed from borrowDate */}
                                                <td className="px-6 py-4 whitespace-nowrap">{borrow.due_date}</td> {/* Changed from returnDate */}
                                                <td className="px-6 py-4 whitespace-nowrap">{borrow.returned ? 'Returned' : 'Borrowed'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {!borrow.returned && (
                                                        <button onClick={() => handleReturnBook(borrow.book.id)} className="text-green-600 hover:text-green-900">Return</button>
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
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">My Library Check-in/out Logs</h4>
                        {libraryLogs.length === 0 ? (
                            <p className="text-gray-600">No library logs found.</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {libraryLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{log.entry_time}</td> {/* Changed from timestamp */}
                                                <td className="px-6 py-4 whitespace-nowrap">{log.exit_time || 'N/A'}</td> {/* Changed from type */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Payments Page
const PaymentsPage = () => {
    const { currentUser } = useContext(AppContext);
    const [paymentsData, setPaymentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [selectedPaymentIdForUpload, setSelectedPaymentIdForUpload] = useState(''); // New state for selecting payment to upload proof for

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
            alert('Payment marked received successfully!');
            fetchPayments(); // Refresh the payments list to show updated status
        } catch (err) {
            setError(`Error marking payment received: ${err.message}`);
            alert(`Error: ${err.message}`); // Use alert for simplicity now, replace with custom modal
            setLoading(false);
        }
    };


    // Renders the payments table
    const renderPaymentsTable = () => {
        if (loading) return <div className="text-center py-4">Loading payments...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (paymentsData.length === 0) return <div className="text-center py-4 text-gray-600">No payment records found.</div>;

        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paymentsData.map((payment) => (
                            <tr key={payment.id}>
                                {(currentUser.role === 'admin' || currentUser.role === 'principal') && <td className="px-6 py-4 whitespace-nowrap">{payment.student_name || payment.student?.username || 'N/A'}</td>}
                                <td className="px-6 py-4 whitespace-nowrap">{payment.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{payment.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{payment.due_date}</td> {/* Changed from dueDate */}
                                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                                    payment.status === 'received' ? 'text-green-600' :
                                    payment.status === 'pending' || payment.status === 'due' ? 'text-red-600' : 'text-yellow-600' // 'pending_proof' will be yellow
                                }`}>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</td> {/* Capitalize status */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* Student/Parent specific actions */}
                                    {(currentUser.role === 'student' || currentUser.role === 'parent') && (payment.status === 'pending' || payment.status === 'due') && (
                                        <>
                                            {/* Link to payment gateway if available */}
                                            {payment.payment_link && (
                                                <a href={payment.payment_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 mr-2">Pay Now</a>
                                            )}
                                            {/* Select payment for proof upload */}
                                            {payment.status !== 'pending_proof' && (
                                                <button onClick={() => setSelectedPaymentIdForUpload(payment.id)} className="text-purple-600 hover:text-purple-900 mr-2">Upload Proof</button>
                                            )}
                                        </>
                                    )}

                                    {/* Admin/Principal specific actions */}
                                    {(currentUser.role === 'admin' || currentUser.role === 'principal') && (
                                        <>
                                            {payment.status === 'pending_proof' && (
                                                <a href={payment.payment_proof} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-900 mr-2">View Proof</a>
                                            )}
                                            {payment.status !== 'received' && (
                                                <button 
                                                    onClick={() => handleMarkReceived(payment.id)}
                                                    className="text-green-600 hover:text-green-900 ml-2"
                                                >
                                                    Mark Received
                                                </button>
                                            )}
                                            {/* Add Edit/Delete buttons for admin if needed */}
                                            <button className="text-indigo-600 hover:text-indigo-900 ml-2">Details</button>
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

            {(currentUser.role === 'student' || currentUser.role === 'parent') && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <SectionTitle>Upload Payment Proof</SectionTitle>
                    <form onSubmit={handleUploadSubmit} className="flex flex-col space-y-4">
                         <label htmlFor="paymentSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Payment to Upload Proof For:</label>
                        <select
                            id="paymentSelect"
                            value={selectedPaymentIdForUpload}
                            onChange={(e) => setSelectedPaymentIdForUpload(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
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
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
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
        </div>
    );
};

// Timetable Page
const TimetablePage = () => {
    const { currentUser } = useContext(AppContext);
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetches structured timetable data based on user role
    React.useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            setError('');
            let url = 'http://127.0.0.1:8000/api/timetable/classes/'; // Base URL for ClassScheduleViewSet
            if (!currentUser || !currentUser.token) {
                setError('User not authenticated for Timetable.');
                setLoading(false);
                console.log('TimetablePage: currentUser or token missing.', currentUser);
                return;
            }

            try {
                // The backend's ClassScheduleViewSet.get_queryset already filters by user role
                // So, the frontend simply calls the base URL, and the backend handles the appropriate data return.
                console.log('TimetablePage: Fetching structured timetable from URL:', url);
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || errorData.message || 'Failed to load timetable');
                }
                const data = await response.json();
                setTimetableData(data);
                setLoading(false);
                console.log('TimetablePage: Timetable data fetched successfully.', data);
            } catch (err) {
                setError(`Failed to load timetable: ${err.message}`);
                setLoading(false);
                console.error('Fetch error (Timetable):', err);
            }
        };
        fetchTimetable();
    }, [currentUser]); // Dependency on currentUser
    const renderTimetableTable = () => {
        if (loading) return <div className="text-center py-4">Loading timetable...</div>;
        if (error) return <div className="text-center py-4 text-red-600">{error}</div>;
        if (timetableData.length === 0) return <div className="text-center py-4 text-gray-600">No timetable found.</div>;

        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>}
                            {(currentUser.role === 'admin' || currentUser.role === 'principal') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {timetableData.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.day}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.time}</td> {/* Now contains start-end time from backend serializer */}
                                <td className="px-6 py-4 whitespace-nowrap">{item.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.room || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.batch_name || 'N/A'}</td> {/* Access batch_name */}
                                {(currentUser.role === 'admin' || currentUser.role === 'principal') && <td className="px-6 py-4 whitespace-nowrap">{item.teacher_name || 'N/A'}</td>} {/* Access teacher_name */}
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
            {renderTimetableTable()}
        </div>
    );
};

const CollegeInOutLogPage = () => {
    const { currentUser } = useContext(AppContext);
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
                const response = await fetch('http://127.0.0.1:8000/api/college_in_out_log/logs/', {
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

    if (loading) return <div className="text-center py-8">Loading logs...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>College Entry/Exit Logs</SectionTitle>
            {logs.length === 0 ? (
                <div className="text-center py-4 text-gray-600">No college entry/exit logs found.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.student?.username || 'N/A'} ({log.student?.role || 'N/A'})</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.entry_time).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.marked_by?.username || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const HostelAttendancePage = () => {
    const { currentUser } = useContext(AppContext);
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
                const response = await fetch('http://127.0.0.1:8000/api/hostel/logs/', {
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

    if (loading) return <div className="text-center py-8">Loading logs...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div>
            <SectionTitle>Hostel Attendance Logs</SectionTitle>
            {logs.length === 0 ? (
                <div className="text-center py-4 text-gray-600">No hostel attendance logs found.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.student?.username || 'N/A'} ({log.student?.role || 'N/A'})</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.entry_time).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{log.marked_by?.username || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const StudentsFacultyInfoPage = () => {
    const { currentUser } = useContext(AppContext);
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

            alert('User deleted successfully.');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Delete User Error:', err);
            alert(`Error deleting user: ${err.message}`);
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

            alert('Bulk upload successful!');
            window.location.reload();
        } catch (err) {
            console.error('Bulk upload error:', err);
            alert(`Bulk upload failed: ${err.message}`);
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
                <label htmlFor="roleFilter" className="block text-gray-700 text-sm font-bold mb-2">Filter by Role:</label>
                <select
                    id="roleFilter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="shadow border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="text-center py-4 text-gray-600">No users found for this filter.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Edit User: {editUser.username}</h3>

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
                                alert(`Failed to update user: ${err.message}`);
                            }
                        }}>
                            <input
                                type="text"
                                value={editFormData.username}
                                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                className="w-full border px-3 py-2 rounded mb-3"
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className="w-full border px-3 py-2 rounded mb-3"
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                value={editFormData.full_name}
                                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                className="w-full border px-3 py-2 rounded mb-3"
                                placeholder="Full Name"
                            />

                            <div className="flex justify-between">
                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save</button>
                                <button type="button" onClick={() => setEditUser(null)} className="text-gray-600 underline">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const LoginPage = () => {
    const { setCurrentUser, setCurrentPage } = useContext(AppContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
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

                console.log('LoginPage: accessToken value before setCurrentUser:', accessToken);

                if (accessToken) {
                    setCurrentUser({
                        id: userId,
                        username: userName,
                        role: userRole,
                        token: accessToken 
                    });
                    setLoginMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                    setCurrentPage('dashboard');
                    console.log('Login successful: Stored currentUser:', { id: userId, username: userName, role: userRole, token: accessToken });
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                {}
                <img
                    src="/_api/content/uploaded:image_f6886c.png-61901599-c37e-4375-b24b-85b653820377"
                    alt="Maharaja Agrasen Medical College Logo"
                    className="mamc-logo mx-auto mb-6 rounded-lg w-full h-auto"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/400x100/A0A0A0/FFFFFF?text=MAMC+Logo';
                    }}
                />

                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">MAMC Portal</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
                    {}
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />

                    {}
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    />

                    {}
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white appearance-none cursor-pointer focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                    >
                        <option value="" disabled>Select Your Role</option>
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="teacher">Teacher</option>
                        <option value="principal">Principal</option>
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
                        className={`mt-6 p-4 rounded-lg text-left ${
                            loginMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                            loginMessage.type === 'error'   ? 'bg-red-100 text-red-800 border border-red-300' :
                                                              'bg-blue-100 text-blue-800 border border-blue-300'
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
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: '',
        full_name: '',
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
            const payload = { ...formData };
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
                username: '', password: '', role: '', full_name: '',
                email: '', student_id: '', faculty_id: '',
                department: '', batch: '', child_id: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    if (!currentUser || !['admin', 'principal', 'hidden_superuser'].includes(currentUser.role)) {
        return <div className="text-center py-10 text-red-600">Unauthorized to create users.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <SectionTitle>Create New User</SectionTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Username" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border rounded px-4 py-2" required />

                <input type="password" placeholder="Password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded px-4 py-2" required />

                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border rounded px-4 py-2" required>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Admin</option>
                </select>

                <input type="text" placeholder="Full Name" value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border rounded px-4 py-2" />

                <input type="email" placeholder="Email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded px-4 py-2" />

                {formData.role === 'student' && (
                    <select value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full border rounded px-4 py-2">
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                )}

                {formData.role === 'teacher' && (
                    <>
                        <input type="text" placeholder="Faculty ID" value={formData.faculty_id}
                            onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                            className="w-full border rounded px-4 py-2" />
                        <input type="text" placeholder="Department" value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full border rounded px-4 py-2" />
                    </>
                )}

                {formData.role === 'parent' && (
                    <select value={formData.child_id}
                        onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                        className="w-full border rounded px-4 py-2">
                        <option value="">Select Child</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.username} ({s.full_name})</option>)}
                    </select>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                    Create User
                </button>

                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}
            </form>
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('login');
    const renderContent = () => {
        if (!currentUser) {
            return <LoginPage setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
        }

        switch (currentPage) {
            case 'login':
                return <LoginPage setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
            case 'dashboard':
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
                        return <div className="text-center py-10 text-xl font-medium text-red-700">Unknown role dashboard. Please contact support.</div>;
                }
            case 'attendance':
                return <AttendancePage />;
            case 'grades':
                return <GradesPage />;
            case 'leaves':
                return <LeavesPage />;
            case 'library':
                return <LibraryPage />;
            case 'payments':
                return <PaymentsPage />;
            case 'timetable':
                return <TimetablePage />;
            case 'myinfo':
                return <MyInfoCornerPage />;
            case 'college-logs':
                return <CollegeInOutLogPage />;
            case 'hostel-attendance':
                return <HostelAttendancePage />;
            case 'users-info':
                return <StudentsFacultyInfoPage />;
            case 'create-user':
                return <CreateUserPage />;
            default:
                return <div className="text-center py-10">Page Not Found.</div>;
        }
    };

    return (
        <AppContext.Provider value={{ currentUser, setCurrentUser, currentPage, setCurrentPage }}>
            {renderContent()}
        </AppContext.Provider>
    );
};

export default App;