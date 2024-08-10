const { URL } = require("url");
require("dotenv").config();

const mqttUrl = new URL(process.env.MQTT_URL);

module.exports = {
  mqttUrl: {
    protocol: mqttUrl.protocol.replace(":", ""),
    host: mqttUrl.hostname,
    port: parseInt(mqttUrl.port),
  },
  mqttUsername: process.env.MQTT_USERNAME,
  mqttPassword: process.env.MQTT_PASSWORD,
  mqttTopic: process.env.MQTT_TOPIC,
};
