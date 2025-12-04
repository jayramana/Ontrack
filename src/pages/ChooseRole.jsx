import React from "react";
import { useNavigate } from "react-router-dom";

export default function ChooseRolePage() {
  const navigate = useNavigate();

  const chooseRole = (selectedRole) => {
    navigate(`/signup/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Create your account</h2>
        <p className="text-center text-gray-500 mb-6">
          Select what type of user you want to be
        </p>

        <div className="space-y-4">
          <button
            onClick={() => chooseRole("customer")}
            className="w-full p-4 border rounded-xl hover:bg-teal-50"
          >
            👤 Customer
          </button>

          <button
            onClick={() => chooseRole("agent")}
            className="w-full p-4 border rounded-xl hover:bg-teal-50"
          >
            🚚 Delivery Agent
          </button>

          <button
            onClick={() => chooseRole("admin")}
            className="w-full p-4 border rounded-xl hover:bg-teal-50"
          >
            🛡️ Admin
          </button>
        </div>
      </div>
    </div>
  );
}
