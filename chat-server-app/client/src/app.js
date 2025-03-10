// client/src/App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // เปลี่ยนเป็น Azure App Service URL เมื่อ Deploy

function App() {
  const [name, setName] = useState("");
  const [partner, setPartner] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    socket.on("waiting", () => setIsWaiting(true));
    socket.on("matched", (partnerName) => {
      setPartner(partnerName);
      setIsWaiting(false);
    });
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("partner_disconnected", () => {
      alert("Your partner disconnected");
      setPartner(null);
    });
  }, []);

  const handleJoin = () => {
    if (name.trim()) {
      socket.emit("join", { name });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessages((prev) => [...prev, { name: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {!partner ? (
        <div>
          <h2>Enter your name to start chatting</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleJoin}>Join</button>
          {isWaiting && <p>Waiting for a partner...</p>}
        </div>
      ) : (
        <div>
          <h2>Chat with {partner}</h2>
          <div style={{ border: "1px solid black", padding: "10px", height: "200px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <p key={index}><b>{msg.name}:</b> {msg.text}</p>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
