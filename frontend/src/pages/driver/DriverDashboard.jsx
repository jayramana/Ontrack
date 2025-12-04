import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 md:col-span-3">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                                <svg
                                    className="h-8 w-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Welcome to Your Driver Portal
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    You are logged in as: <span className="font-semibold">{user?.role}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Today's Deliveries</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg
                                    className="h-8 w-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg
                                    className="h-8 w-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Transit</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg
                                    className="h-8 w-8 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for future features */}
                    <div className="bg-green-50 rounded-xl border-2 border-dashed border-green-200 p-8 md:col-span-3">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                🚚 Phase 1 Complete!
                            </h3>
                            <p className="text-green-700">
                                Route management and delivery tracking features coming in Phase 2
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverDashboard;
