const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config');
const setupMQTTClient = require('./mqttconfig');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const batteryCapacityKWh = 21.6;
let accumulatedData = {};

function calculateETA(currentChargeKWh, powerW, isCharging) {
  const powerKW = powerW / 1000;
  if (powerKW === 0) return '∞';
  const etaHours = isCharging
    ? (batteryCapacityKWh - currentChargeKWh) / powerKW
    : currentChargeKWh / powerKW;
  return (etaHours * 60).toFixed(0);
}

const client = setupMQTTClient();

const topics = ['solar_assistant/#'];

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(topics, (err) => {
    if (!err) console.log('Subscribed to topics');
    else console.error(`Error subscribing to topics: ${err}`);
  });
});

const mapTopicToKey = (topic) => {
  const mappings = {
    'solar_assistant/battery_1/current/state': 'batteryCurrent',
    'solar_assistant/battery_1/voltage/state': 'batteryVoltage',
    'solar_assistant/inverter_1/ac_output_frequency/state':
      'inverterGridFrequency',
    'solar_assistant/inverter_1/battery_capacity/state': 'batteryStateOfCharge',
    'solar_assistant/inverter_1/battery_charging_current/state':
      'batteryChargeCurrent',
    'solar_assistant/inverter_1/battery_discharge_current/state':
      'batteryDischargeCurrent',
    'solar_assistant/inverter_1/battery_temperature/state':
      'batteryTemperature',
    'solar_assistant/inverter_1/battery_voltage/state': 'batteryVoltage',
    'solar_assistant/inverter_1/grid_power/state': 'inverterGridPower',
    'solar_assistant/inverter_1/grid_voltage/state': 'inverterGridVoltage',
    'solar_assistant/inverter_1/load_apparent_power/state': 'loadApparentPower',
    'solar_assistant/inverter_1/load_percentage/state': 'loadPercentage',
    'solar_assistant/inverter_1/load_power/state': 'loadPower',
    'solar_assistant/inverter_1/pv_current/state': 'solarCurrent',
    'solar_assistant/inverter_1/pv_power/state': 'solarPower',
    'solar_assistant/inverter_1/pv_voltage/state': 'solarVoltage',
    'solar_assistant/inverter_1/temperature/state': 'inverterTemperature',
    'solar_assistant/load/apparent_power/state': 'loadApparentPower',
    'solar_assistant/load/power_factor/state': 'loadPowerFactor',
    'solar_assistant/load/power/state': 'loadPower',
    'solar_assistant/total/battery_power/state': 'totalBatteryPower',
    'solar_assistant/total/battery_state_of_charge/state': 'totalBatterySOC',
    'solar_assistant/total/bus_voltage/state': 'busVoltage',
  };
  return mappings[topic] || null;
};

client.on('message', (topic, message) => {
  if (topic.includes('homeassistant')) return;

  const key = mapTopicToKey(topic);
  if (!key) return;

  let value = parseFloat(message.toString());
  accumulatedData[key] = isNaN(value) ? message.toString() : value;

  if (
    accumulatedData['totalBatterySOC'] !== undefined &&
    accumulatedData['totalBatteryPower'] !== undefined &&
    accumulatedData['loadPower'] !== undefined
  ) {
    const currentChargeKWh =
      (accumulatedData['totalBatterySOC'] / 100) * batteryCapacityKWh;
    accumulatedData['chargeETA'] = calculateETA(
      currentChargeKWh,
      accumulatedData['totalBatteryPower'],
      true
    );
    accumulatedData['dischargeETA'] = calculateETA(
      currentChargeKWh,
      accumulatedData['loadPower'],
      false
    );
  }

  console.log('Accumulated data to be sent:', accumulatedData);
  io.emit('solarData', accumulatedData);
});

client.on('error', (error) => {
  console.error('MQTT client error:', error);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  console.log('Sending initial data:', accumulatedData);
  socket.emit('solarData', accumulatedData);
});

app.get('/status', (req, res) => {
  res.json({
    server: 'running',
    mqttStatus: client.connected ? 'connected' : 'disconnected',
    mqttConfig: {
      protocol: config.mqttUrl.protocol,
      host: config.mqttUrl.host,
      port: config.mqttUrl.port,
      topic: config.mqttTopic,
    },
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optionally, you can choose to exit the process here
  // process.exit(1);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can choose to exit the process here
  // process.exit(1);
});
