import { useState, useEffect } from 'react';
import MapComponent from '../../components/MapComponent';
import * as signalR from '@microsoft/signalr';

function Tracking() {
  const [driverLocation, setDriverLocation] = useState(null);
  const [orderStatus, setOrderStatus] = useState('Out for Delivery');
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
      await newConnection.invoke("JoinDriverTrackingGroup", driverId);
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>
      <div className="mb-4">
        <span className="font-semibold">Status: </span>
        <span className="text-blue-600">{orderStatus}</span>
      </div>
      <div className="mb-6">
        <MapComponent
          center={driverLocation ? [driverLocation.lat, driverLocation.lng] : [13.0827, 80.2707]}
          zoom={13}
          markers={markers}
        />
      </div>
    </div>
  );
}

export default Tracking;