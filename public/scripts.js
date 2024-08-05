const socket = io();
let lastData = {};

function formatValue(value, unit, decimals = false) {
  if (typeof value !== 'number') return value || '0';

  let formattedValue;
  switch (unit) {
    case '°C':
    case 'A':
    case 'Hz':
    case 'V':
    case 'VA':
    case 'W':
      formattedValue = decimals ? value.toFixed(2) : Math.round(value);
      return `${formattedValue} ${unit}`;
    case '%':
      return `${Math.round(value)}${unit}`;
    default:
      return value.toFixed(2);
  }
}

function formatETA(minutes) {
  if (minutes === '∞') return '∞';
  const totalMinutes = parseInt(minutes);
  if (isNaN(totalMinutes)) return '0h 0m';

  const sign = totalMinutes < 0 ? '-' : '';
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainingMinutes = absoluteMinutes % 60;
  return `${sign}${hours}h ${remainingMinutes}m`;
}

function updateDashboard(data) {
  console.log('Updating dashboard with data:', data);
  lastData = { ...lastData, ...data };

  Object.keys(lastData).forEach((key) => {
    const element = document.getElementById(key);
    if (!element) return;

    let unit = '';
    switch (key) {
      case 'totalBatterySOC':
      case 'loadPercentage':
        unit = '%';
        break;
      case 'totalBatteryPower':
      case 'loadPower':
      case 'solarPower':
      case 'inverterGridPower':
        unit = 'W';
        break;
      case 'loadApparentPower':
        unit = 'VA';
        break;
      case 'batteryCurrent':
      case 'solarCurrent':
        unit = 'A';
        break;
      case 'batteryVoltage':
      case 'solarVoltage':
      case 'inverterGridVoltage':
      case 'busVoltage':
        unit = 'V';
        break;
      case 'inverterTemperature':
        unit = '°C';
        break;
      case 'inverterGridFrequency':
        unit = 'Hz';
        break;
    }

    if (key === 'chargeETA' || key === 'dischargeETA') {
      element.textContent = formatETA(lastData[key]);
    } else {
      const decimals = !element.classList.contains('no-decimals');
      element.textContent = formatValue(lastData[key], unit, decimals);
    }
  });
}

socket.on('solarData', (data) => {
  updateDashboard(data);
});
