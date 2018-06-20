const MAX_AVG_POINTS = 30;
const SENSOR = 4;

const DANGER_VALUE = 650;
const WARNING_VALUE = 520;

const STATE_START = 0;
const STATE_WAIT = 1;
const STATE_TARE = 2;
const STATE_WEIGHT = 3;

const TARE_WAIT = 200;
const TARE_POINT = 200;

var avgValue = [];
var avgSum = [];
var pointer = [];
var tare = [];

var counterTare = [];

var state = STATE_START;

function sensorInit() {
    for (sensor=0; sensor < SENSOR; sensor++) {
        avgValue[sensor] = [];
        for (point=0; point < MAX_AVG_POINTS; point++) {
            avgValue[sensor][point] = 0;
        }
        pointer[sensor] = 0;
        avgSum[sensor] = 0;

        tare[sensor] = 0;
        counterTare[sensor] = 0;
    }
}

function sensorCompute(sensor, value) {
    if (sensor >= SENSOR) {
        return 0;
    }

    avgSum[sensor] += value;
    avgSum[sensor] -= avgValue[sensor][pointer[sensor]];
    avgValue[sensor][pointer[sensor]] = value;
    pointer[sensor] = (pointer[sensor] + 1) % MAX_AVG_POINTS;
    return avgSum[sensor] / MAX_AVG_POINTS;
}

function sensorGetColor(weight) {
    if (weight >= DANGER_VALUE) {
        return "progress-bar-danger";
    }
    if (weight >= WARNING_VALUE) {
        return "progress-bar-warning";
    }
    return "progress-bar-success";
}

function sensorTare(sensor, value) {
    if (sensor >= SENSOR) {
        return 0;
    }

    if (counterTare[sensor] <= TARE_WAIT) {
        counterTare[sensor] += 1;
        document.getElementById("progress-tare").style.width = counterTare[sensor] / 4 + '%';
    } else if (counterTare[sensor] <= TARE_WAIT + TARE_POINT) {
        tare[sensor] += value;
        counterTare[sensor] += 1;
        document.getElementById("progress-tare").style.width = counterTare[sensor] / 4 + '%';
    } else {
        sensorSetState(STATE_WEIGHT);
        sensorDisplay();
    }
}

function sensorConvert(sensor, value) {
    if (sensor >= SENSOR) {
        return 0;
    }

    value -= tare[sensor] / TARE_POINT;
    return 959222 * value;
}

function sensorIsr(sensor, value) {
    value = sensorCompute(sensor, value);
    sensorTare(sensor, value);
    var weight = sensorConvert(sensor, value);

    document.getElementById("weight-"+sensor).innerHTML = "<b>Sensor "+sensor+" : </b>" + Math.round(weight / 10) * 10 + "gr";
    document.getElementById("progress-"+sensor).classList.remove("progress-bar-success");
    document.getElementById("progress-"+sensor).classList.remove("progress-bar-warning");
    document.getElementById("progress-"+sensor).classList.remove("progress-bar-danger");
    document.getElementById("progress-"+sensor).classList.add(sensorGetColor(weight));
    weight = Math.round(weight / 780 * 100);
    document.getElementById("progress-"+sensor).style.width = weight+'%';
}

function sensorDisplay() {
    if (state === STATE_START) {
        document.getElementById("start").style.display = 'block';
        document.getElementById("wait").style.display = 'none';
        document.getElementById("tare").style.display = 'none';
        document.getElementById("weight").style.display = 'none';
    } else if (state === STATE_WAIT) {
        document.getElementById("start").style.display = 'none';
        document.getElementById("wait").style.display = 'block';
        document.getElementById("tare").style.display = 'none';
        document.getElementById("weight").style.display = 'none';
    } else if (state === STATE_TARE) {
        document.getElementById("start").style.display = 'none';
        document.getElementById("wait").style.display = 'none';
        document.getElementById("tare").style.display = 'block';
        document.getElementById("weight").style.display = 'none';
    } else if (state === STATE_WEIGHT) {
        document.getElementById("start").style.display = 'none';
        document.getElementById("wait").style.display = 'none';
        document.getElementById("tare").style.display = 'none';
        document.getElementById("weight").style.display = 'block';
    }
}

function sensorSetState(newState) {
    state = newState;
}
