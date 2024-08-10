const socket = io();
let lastData = {};

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

function initializeExpandableCards() {
  const cards = document.querySelectorAll(".dashboard-card");
  cards.forEach((card) => {
    const title = card.querySelector(".card-title");
    title.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        card.classList.toggle("expanded");
      }
    });

    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          card.classList.toggle("expanded");
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeExpandableCards);

function formatValue(value, unit, convertedUnit, isInConvertedUnit) {
  if (typeof value !== "number" || isNaN(value) || value === 0) return "N/A";

  let formattedValue = value.toFixed(2);

  switch (unit) {
    case "°C":
      return `${formattedValue}°C (${((value * 9) / 5 + 32).toFixed(2)}°F)`;
    case "A":
      return isInConvertedUnit
        ? `${(value * 1000).toFixed(0)} mA`
        : `${formattedValue} A`;
    case "V":
      return `${formattedValue} V`;
    case "W":
      return isInConvertedUnit
        ? `${(value / 1000).toFixed(2)} kW`
        : `${formattedValue} W`;
    case "VA":
      return `${formattedValue} VA`;
    case "Hz":
      return `${formattedValue} Hz`;
    case "%":
      return `${formattedValue} %`;
    default:
      return `${formattedValue} ${isInConvertedUnit ? convertedUnit : unit}`;
  }
}

function updateDashboard(data) {
  lastData = { ...lastData, ...data };

  const dataPoints = {
    batteryAbsorptionChargeVoltage: {
      value: lastData.batteryAbsorptionChargeVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    batteryCurrent: {
      value: lastData.batteryCurrent,
      unit: "A",
      convertedUnit: "mA",
    },
    batteryFloatChargeVoltage: {
      value: lastData.batteryFloatChargeVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    batteryTemperature: {
      value: lastData.batteryTemperature,
      unit: "°C",
      convertedUnit: "°F",
    },
    batteryVoltage: {
      value: lastData.batteryVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    busVoltage: { value: lastData.busVoltage, unit: "V", convertedUnit: "V" },
    chargeETA: {
      value: lastData.chargeETA,
      unit: "",
      convertedUnit: "",
    },
    chargerSourcePriority: {
      value: lastData.chargerSourcePriority,
      unit: "",
      convertedUnit: "",
    },
    dischargeETA: {
      value: lastData.dischargeETA,
      unit: "",
      convertedUnit: "",
    },
    inverterGridPower: {
      value: lastData.inverterGridPower,
      unit: "W",
      convertedUnit: "kW",
    },
    inverterGridVoltage: {
      value: lastData.inverterGridVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    inverterTemperature: {
      value: lastData.inverterTemperature,
      unit: "°C",
      convertedUnit: "°F",
    },
    loadApparentPower: {
      value: lastData.loadApparentPower,
      unit: "VA",
      convertedUnit: "VA",
    },
    loadPercentage: {
      value: lastData.loadPercentage,
      unit: "%",
      convertedUnit: "%",
    },
    loadPower: { value: lastData.loadPower, unit: "W", convertedUnit: "kW" },
    maxChargeCurrent: {
      value: lastData.maxChargeCurrent,
      unit: "A",
      convertedUnit: "mA",
    },
    maxGridChargeCurrent: {
      value: lastData.maxGridChargeCurrent,
      unit: "A",
      convertedUnit: "mA",
    },
    outputSourcePriority: {
      value: lastData.outputSourcePriority,
      unit: "",
      convertedUnit: "",
    },
    powerSaving: { value: lastData.powerSaving, unit: "", convertedUnit: "" },
    shutdownBatteryVoltage: {
      value: lastData.shutdownBatteryVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    solarCurrent: {
      value: lastData.solarCurrent,
      unit: "A",
      convertedUnit: "mA",
    },
    solarPower: { value: lastData.solarPower, unit: "W", convertedUnit: "kW" },
    solarVoltage: {
      value: lastData.solarVoltage,
      unit: "V",
      convertedUnit: "V",
    },
    totalBatteryPower: {
      value: lastData.totalBatteryPower,
      unit: "W",
      convertedUnit: "kW",
    },
    totalBatterySOC: {
      value: lastData.totalBatterySOC,
      unit: "%",
      convertedUnit: "kWh",
    },
    totalSolar: {
      value:
        (lastData.solarPower /
          ((lastData.totalBatterySOC / 100) * 21.6 * 1000)) *
        100,
      unit: "%",
      convertedUnit: "%",
    },
  };

  Object.keys(dataPoints).forEach((key) => {
    const element = document.getElementById(key);
    if (element) {
      const { value, unit, convertedUnit } = dataPoints[key];
      let isInConvertedUnit = element.dataset.isInConvertedUnit === "true";

      if (key === "chargeETA" || key === "dischargeETA") {
        element.innerHTML = `<span class="card-info-data">${value}</span>`;
      } else {
        element.innerHTML = `
          <span class="card-info-data">${formatValue(
            value,
            unit,
            convertedUnit,
            isInConvertedUnit
          )}</span>
        `;

        element.addEventListener("click", () => {
          isInConvertedUnit = !isInConvertedUnit;
          element.dataset.isInConvertedUnit = isInConvertedUnit.toString();
          element.innerHTML = `
            <span class="card-info-data">${formatValue(
              value,
              unit,
              convertedUnit,
              isInConvertedUnit
            )}</span>
          `;
        });
      }
    } else {
      console.error(`Element with ID "${key}" not found in the DOM.`);
    }
  });
}

socket.on("solarData", (data) => {
  updateDashboard(data);
});
