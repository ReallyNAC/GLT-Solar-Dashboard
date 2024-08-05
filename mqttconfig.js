const mqtt = require('mqtt');
const config = require('./config');

function setupMQTTClient() {
  console.log('Attempting to connect to MQTT broker:', config.mqttUrl);

  const client = mqtt.connect({
    protocol: config.mqttUrl.protocol,
    host: config.mqttUrl.host,
    port: config.mqttUrl.port,
    username: config.mqttUsername,
    password: config.mqttPassword,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    rejectUnauthorized: false,
    debug: true, // Enable debug logs
    keepalive: 60, // Increase keepalive interval
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(config.mqttTopic, (err) => {
      if (!err) console.log('Subscribed to topic:', config.mqttTopic);
      else console.error('Subscription error:', err);
    });
  });

  client.on('error', (error) => {
    console.error('MQTT client error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
  });

  client.on('close', () => {
    console.log('MQTT client disconnected');
  });

  client.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT broker');
  });

  client.on('offline', () => {
    console.log('MQTT client is offline');
  });

  return client;
}

module.exports = setupMQTTClient;
