import { Link } from 'react-router-dom';
import SenderSidebar from "./SellerSidebar";
import { useAuth } from "../../context/AuthContext";

function SenderDashboard() {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen flex bg-[#f8f4ef]">

            {/* SIDEBAR */}
            <SenderSidebar active="dashboard" />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">

                {/* HEADER BAR */}
                <header className="bg-[#f8f4ef] shadow-sm border-b border-[#e6ddc5]">
                    <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

                        <div>
                            <h1 className="text-3xl font-bold text-[#351c15]">Sender Dashboard</h1>
                            <p className="text-[#6f4e37] text-sm mt-1">
                                Welcome, {user?.first_name} {user?.last_name}!
                            </p>
                        </div>

                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-[#351c15] hover:bg-[#4a2a21] text-white rounded-lg shadow"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* MAIN PAGE CONTENT */}
                <div className="flex-1 p-8">

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-6">

                        {/* ACTIONS CARD */}
                        <div className="bg-white border border-[#e6d8c9] rounded-xl shadow p-6">
                            <h2 className="text-xl font-semibold text-[#351c15] mb-4">Quick Actions</h2>

                            <Link
                                to="/seller/placeorder"
                                className="block w-full bg-[#ffb500] text-[#351c15] font-semibold text-center p-3 rounded-lg 
                                hover:bg-[#e6a300] transition mb-4"
                            >
                                Place New Order
                            </Link>

                            <Link
                                to="/seller/senderorders"
                                className="block w-full bg-[#351c15] text-white font-semibold text-center p-3 rounded-lg 
                                hover:bg-[#2b160f] transition"
                            >
                                View My Orders
                            </Link>
                        </div>

                        {/* RECENT ACTIVITY */}
                        <div className="bg-white border border-[#e6d8c9] rounded-xl shadow p-6">
                            <h2 className="text-xl font-semibold text-[#351c15] mb-4">Recent Activity</h2>

                            <div className="text-[#6b4f3a]">
                                No recent orders.
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default SenderDashboard;
