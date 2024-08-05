const mqtt = require('mqtt');
const config = require('./config');

function setupMQTTClient() {
  const client = mqtt.connect({
    protocol: config.mqttUrl.protocol,
    host: config.mqttUrl.host,
    port: config.mqttUrl.port,
    username: config.mqttUsername,
    password: config.mqttPassword,
    reconnectPeriod: 5000, // Try to reconnect every 5 seconds
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(config.mqttTopic, (err) => {
      if (!err) console.log('Subscribed to topic:', config.mqttTopic);
      else console.error('Subscription error:', err);
    });
  });

  client.on('error', (error) => {
    console.error('MQTT client error:', error);
  });

  client.on('close', () => {
    console.log('MQTT client disconnected');
  });

  client.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT broker');
  });

  return client;
}

module.exports = setupMQTTClient;
