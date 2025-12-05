import { useAuth } from '../../context/AuthContext';
import CustomerSidebar from "./CustomerSidebar";

const CustomerDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* Sidebar */}
            <CustomerSidebar />

            {/* Right Side Content */}
            <div className="flex-1">

                {/* Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
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
                                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                                    <svg
                                        className="h-8 w-8 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Welcome to Your Customer Portal
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        You are logged in as: <span className="font-semibold">{user?.role}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Active Orders */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Orders</p>
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
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Delivered */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Delivered</p>
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
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                                </div>
                                <div className="bg-yellow-100 rounded-full p-3">
                                    <svg
                                        className="h-8 w-8 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Placeholder */}
                        <div className="bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200 p-8 md:col-span-3">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                                    🚀 Phase 1 Complete!
                                </h3>
                                <p className="text-indigo-700">
                                    Order tracking and management features coming in Phase 2
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboard;
