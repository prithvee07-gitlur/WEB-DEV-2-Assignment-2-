const API_KEY = "a65df0c6d5f08b142b84e095b513d6f9";
const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

var cityInput = document.getElementById("city-input");
var searchBtn = document.getElementById("search-btn");
var loader = document.getElementById("loader");
var errorBox = document.getElementById("error-box");
var errorText = document.getElementById("error-text");
var weatherTable = document.getElementById("weather-table");
var placeholder = document.getElementById("placeholder");
var historyList = document.getElementById("history-list");
var noHistory = document.getElementById("no-history");
var consoleOutput = document.getElementById("console-output");

function logToConsole(message, color) {
    var line = document.createElement("div");
    line.textContent = message;
    if (color) line.style.color = color;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    console.log(message);
}

logToConsole("1. [SYNC] Script loaded - runs FIRST", "#42a5f5");

setTimeout(function () {
    logToConsole("3. [ASYNC - Macro Task] setTimeout callback - runs AFTER sync code", "#26c6da");
}, 0);

Promise.resolve().then(function () {
    logToConsole("2. [ASYNC - Micro Task] Promise.then() - runs BEFORE setTimeout", "#ab47bc");
});

logToConsole("1. [SYNC] Setting up event listeners...", "#42a5f5");

async function fetchWeather(city) {
    logToConsole("--- Searching: " + city + " ---", "#ffa726");
    logToConsole("[SYNC] fetchWeather() called", "#42a5f5");

    loader.style.display = "block";
    errorBox.style.display = "none";
    weatherTable.style.display = "none";

    var url = API_BASE + "?q=" + city + "&appid=" + API_KEY + "&units=metric";

    logToConsole("[SYNC] About to call fetch()...", "#42a5f5");

    try {
        var response = await fetch(url);

        logToConsole("[ASYNC] fetch() resolved", "#66bb6a");
        logToConsole("[ASYNC] Status: " + response.status, "#66bb6a");

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Check spelling.");
            } else {
                throw new Error("Server error: " + response.status);
            }
        }

        var data = await response.json();
        logToConsole("[ASYNC] Got data: " + data.name + ", " + data.main.temp + "°C", "#66bb6a");

        document.getElementById("city-name").textContent = data.name + ", " + data.sys.country;
        document.getElementById("temperature").textContent = data.main.temp + " °C";
        document.getElementById("weather-desc").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = data.main.humidity + "%";
        document.getElementById("wind").textContent = data.wind.speed + " m/s";

        placeholder.style.display = "none";
        weatherTable.style.display = "table";

        saveHistory(data.name);

    } catch (error) {
        logToConsole("[CATCH] Error: " + error.message, "#ef5350");
        errorText.textContent = error.message;
        errorBox.style.display = "block";
        placeholder.style.display = "none";
    } finally {
        loader.style.display = "none";
        logToConsole("[FINALLY] Done", "#42a5f5");
    }
}

function fetchWithThenCatch(city) {
    logToConsole("[DEMO] .then()/.catch() pattern:", "#ffa726");
    logToConsole("[SYNC] Before fetch", "#42a5f5");

    var url = API_BASE + "?q=" + city + "&appid=" + API_KEY + "&units=metric";

    fetch(url)
        .then(function (response) {
            logToConsole("[.then()] Response received", "#66bb6a");
            if (!response.ok) throw new Error("Error " + response.status);
            return response.json();
        })
        .then(function (data) {
            logToConsole("[.then()] Parsed: " + data.name, "#66bb6a");
        })
        .catch(function (error) {
            logToConsole("[.catch()] " + error.message, "#ef5350");
        });

    logToConsole("[SYNC] After fetch - this logs BEFORE .then()!", "#42a5f5");
}

function getHistory() {
    var data = localStorage.getItem("weatherHistory");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

function saveHistory(city) {
    var history = getHistory();
    var filtered = [];
    for (var i = 0; i < history.length; i++) {
        if (history[i].toLowerCase() !== city.toLowerCase()) {
            filtered.push(history[i]);
        }
    }
    filtered.unshift(city);
    while (filtered.length > 8) {
        filtered.pop();
    }
    localStorage.setItem("weatherHistory", JSON.stringify(filtered));
    showHistory();
}

function showHistory() {
    var history = getHistory();
    var buttons = historyList.querySelectorAll(".history-item");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].remove();
    }

    if (history.length === 0) {
        noHistory.style.display = "block";
        return;
    }

    noHistory.style.display = "none";

    for (var j = 0; j < history.length; j++) {
        var btn = document.createElement("button");
        btn.className = "history-item";
        btn.textContent = history[j];
        btn.addEventListener("click", function () {
            cityInput.value = this.textContent;
            search();
        });
        historyList.appendChild(btn);
    }
}

function search() {
    var city = cityInput.value.trim();
    if (!city) {
        errorText.textContent = "Please enter a city name.";
        errorBox.style.display = "block";
        return;
    }

    fetchWeather(city);
    fetchWithThenCatch(city);

    logToConsole("[SYNC] search() done - fetches still pending!", "#42a5f5");
}

searchBtn.addEventListener("click", search);

cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") search();
});

logToConsole("1. [SYNC] Loading history from localStorage...", "#42a5f5");
showHistory();
logToConsole("1. [SYNC] Script done!", "#42a5f5");
logToConsole("Search a city to see event loop in action!", "#ffa726");