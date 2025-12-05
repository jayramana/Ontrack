export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-1">Seller Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome Seller! Manage your products and orders easily.
      </p>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Products</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">New Orders</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Pending Shipments</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

      </div>

      {/* Products Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Products</h2>
          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
            Add Product
          </button>
        </div>

        <p className="text-gray-500 text-sm">No products added yet.</p>
      </div>

      {/* Orders Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>

        <p className="text-gray-500 text-sm">No recent orders.</p>
      </div>

    </div>
  );
}
