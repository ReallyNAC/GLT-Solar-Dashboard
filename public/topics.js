const topicMapping = {
  "solar_assistant/inverter_1/ac_output_frequency/state":
    "inverterGridFrequency",
  "solar_assistant/inverter_1/battery_capacity/state": "batteryStateOfCharge",
  "solar_assistant/inverter_1/battery_charging_current/state":
    "batteryChargeCurrent",
  "solar_assistant/inverter_1/battery_discharge_current/state":
    "batteryDischargeCurrent",
  "solar_assistant/inverter_1/battery_temperature/state": "batteryTemperature",
  "solar_assistant/battery_1/current/state": "batteryCurrent",
  "solar_assistant/battery_1/voltage/state": "batteryVoltage",
  "solar_assistant/inverter_1/battery_voltage/state": "batteryVoltage",
  "solar_assistant/inverter_1/charger_source_priority/state":
    "chargerSourcePriority",
  "solar_assistant/inverter_1/grid_power/state": "inverterGridPower",
  "solar_assistant/inverter_1/grid_voltage/state": "inverterGridVoltage",
  "solar_assistant/inverter_1/load_apparent_power/state": "loadApparentPower",
  "solar_assistant/inverter_1/load_percentage/state": "loadPercentage",
  "solar_assistant/inverter_1/load_power/state": "loadPower",
  "solar_assistant/inverter_1/max_charge_current/state": "maxChargeCurrent",
  "solar_assistant/inverter_1/max_grid_charge_current/state":
    "maxGridChargeCurrent",
  "solar_assistant/inverter_1/output_source_priority/state":
    "outputSourcePriority",
  "solar_assistant/inverter_1/power_saving/state": "powerSaving",
  "solar_assistant/inverter_1/pv_current/state": "solarCurrent",
  "solar_assistant/inverter_1/pv_power/state": "solarPower",
  "solar_assistant/inverter_1/pv_voltage/state": "solarVoltage",
  "solar_assistant/inverter_1/shutdown_battery_voltage/state":
    "shutdownBatteryVoltage",
  "solar_assistant/inverter_1/temperature/state": "inverterTemperature",
  "solar_assistant/load/apparent_power/state": "loadApparentPower",
  "solar_assistant/load/power/state": "loadPower",
  "solar_assistant/total/battery_power/state": "totalBatteryPower",
  "solar_assistant/total/battery_state_of_charge/state": "totalBatterySOC",
  "solar_assistant/total/bus_voltage/state": "busVoltage",
};

const topics = ["solar_assistant/#"];

module.exports = {
  topicMapping,
  topics,
};
