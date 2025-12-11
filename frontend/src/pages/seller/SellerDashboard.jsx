import { Link } from 'react-router-dom';

function SenderDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Sender Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <Link to="/sender/place-order" className="block w-full bg-blue-600 text-white text-center p-3 rounded hover:bg-blue-700 mb-4">
                        Place New Order
                    </Link>
                    <Link to="/sender/orders" className="block w-full bg-gray-600 text-white text-center p-3 rounded hover:bg-gray-700">
                        View My Orders
                    </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <p className="text-gray-600">No recent orders.</p>
                </div>
            </div>
        </div>
    );
}

export default SenderDashboard;
