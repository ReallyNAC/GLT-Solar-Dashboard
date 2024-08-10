const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const config = require("./config");
const setupMQTTClient = require("./mqttconfig");
const { topicMapping, topics } = require("./public/topics");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const batteryCapacityKWh = 21.6;
let accumulatedData = {};

function calculateChargeDischargeETA(
  currentChargeKWh,
  batteryCapacityKWh,
  powerW,
  isCharging
) {
  const powerKW = powerW / 1000;
  if (powerKW === 0) return "∞";

  const remainingChargeKWh = isCharging
    ? batteryCapacityKWh - currentChargeKWh
    : currentChargeKWh;
  const etaHours = remainingChargeKWh / powerKW;
  const etaMinutes = (etaHours * 60).toFixed(0);
  const etaHoursInt = Math.floor(etaHours);
  const etaMinutesInt = parseInt(etaMinutes) - etaHoursInt * 60;
  const percentPerHour = isCharging
    ? (100 - (currentChargeKWh / batteryCapacityKWh) * 100) / etaHours
    : ((currentChargeKWh / batteryCapacityKWh) * 100) / etaHours;

  return `${etaHoursInt}h ${etaMinutesInt}m (${percentPerHour.toFixed(
    2
  )}% per hour)`;
}

const client = setupMQTTClient();

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  console.log(
    "MQTT client state:",
    client.connected ? "connected" : "disconnected"
  );
  client.subscribe(topics, (err) => {
    if (!err) {
      console.log("Subscribed to topics:", topics);
      console.log("Current subscriptions:", client.subscriptions);
    } else console.error(`Error subscribing to topics: ${err}`);
  });
});

client.on("message", (topic, message) => {
  console.log("Received message on topic:", topic);
  console.log("Message content:", message.toString());
  if (topic.includes("homeassistant")) return;

  const key = topicMapping[topic];
  if (!key) return;

  let value = parseFloat(message.toString());
  accumulatedData[key] = isNaN(value) ? message.toString() : value;

  if (
    accumulatedData["totalBatterySOC"] !== undefined &&
    accumulatedData["totalBatteryPower"] !== undefined &&
    accumulatedData["loadPower"] !== undefined
  ) {
    const currentChargeKWh =
      (accumulatedData["totalBatterySOC"] / 100) * batteryCapacityKWh;
    accumulatedData["chargeETA"] = calculateChargeDischargeETA(
      currentChargeKWh,
      batteryCapacityKWh,
      accumulatedData["totalBatteryPower"],
      true
    );
    accumulatedData["dischargeETA"] = calculateChargeDischargeETA(
      currentChargeKWh,
      batteryCapacityKWh,
      accumulatedData["loadPower"],
      false
    );
  }

  console.log("Accumulated data to be sent:", accumulatedData);
  io.emit("solarData", accumulatedData);
});

client.on("error", (error) => {
  console.error("MQTT client error:", error);
});

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log("Sending initial data:", accumulatedData);
  socket.emit("solarData", accumulatedData);
});

app.get("/status", (req, res) => {
  res.json({
    server: "running",
    mqttStatus: client.connected ? "connected" : "disconnected",
    mqttConfig: {
      protocol: config.mqttUrl.protocol,
      host: config.mqttUrl.host,
      port: config.mqttUrl.port,
      topic: config.mqttTopic,
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mqtt: client.connected ? "connected" : "disconnected",
    subscriptions: client.subscriptions,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    "MQTT client state:",
    client.connected ? "connected" : "disconnected"
  );
  console.log("Current subscriptions:", client.subscriptions);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
