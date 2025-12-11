import { useState, useEffect } from "react";
import MapComponent from "../../components/MapComponent";
import * as signalR from "@microsoft/signalr";
import { useParams } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";

function Tracking() {
  const [driverLocation, setDriverLocation] = useState(null);
  const [orderStatus] = useState("Out for Delivery");
  const [connection, setConnection] = useState(null);

  // Mock Order ID and Driver ID for demo
  const driverId = 2;

  const setupSignalR = async () => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5066/hubs/logistics")
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveDriverLocation", (id, lat, lng) => {
      if (id === driverId) {
        setDriverLocation({ lat, lng });
      }
    });

    try {
      await newConnection.start();
      await newConnection.invoke(
        "JoinDriverTrackingGroup",
        driverId,
        Number(orderId)
      );
      setConnection(newConnection);
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5066/hubs/logistics")
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveDriverLocation", (id, lat, lng) => {
      if (id === driverId && isMounted) {
        setDriverLocation({ lat, lng });
      }
    });

    newConnection.start()
      .then(() => newConnection.invoke("JoinDriverTrackingGroup", driverId))
      .then(() => {
        if (isMounted) setConnection(newConnection);
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
      });

    return () => {
      isMounted = false;
      newConnection.stop();
    };
  }, []);

  const markers = driverLocation ? [{
    position: [driverLocation.lat, driverLocation.lng],
    popup: "Your Driver"
  }] : [];

  return (
    <div className="min-h-screen flex bg-[#f7f3ef]">

      {/* Sidebar */}
      <CustomerSidebar active="tracking" />

      {/* Main Content */}
      <div className="flex-1 p-10">

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-[#351c15]">
          Track Your Order
        </h2>

        {/* Status Box */}
        <div className="mb-6 inline-block bg-[#fff8e7] border border-[#e6ddc5] px-4 py-2 rounded-xl shadow">
          <span className="font-semibold text-[#351c15]">Status: </span>
          <span className="text-[#6f4e37]">{orderStatus}</span>
        </div>

        {/* Map Card */}
        <div className="bg-[#fff8e7] border border-[#e6ddc5] rounded-xl shadow p-4">
          <MapComponent
            center={
              driverLocation
                ? [driverLocation.lat, driverLocation.lng]
                : [13.0827, 80.2707]
            }
            zoom={13}
            markers={markers}
          />
        </div>

      </div>
    </div>
  );
}

export default Tracking;