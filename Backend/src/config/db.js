const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;
  } catch (error) {
    console.error(`Database Connection Warning: ${error.message}`);
    console.log("Will retry connecting to MongoDB in 6 seconds... (Server remains active on Port 5000)");
    isConnecting = false;

    // Retry connection gracefully without crashing the Node.js server
    setTimeout(connectDB, 6000);
  }
};

module.exports = connectDB;
