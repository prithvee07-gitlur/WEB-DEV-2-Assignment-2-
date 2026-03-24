const API_KEY = "a65df0c6d5f08b142b84e095b513d6f9";

const weatherBox = document.getElementById("weather");
const historyBox = document.getElementById("history");
const cityInput = document.getElementById("cityInput");
const consoleBox = document.getElementById("console");

function logConsole(message, type) {
    var div = document.createElement("div");
    div.className = "line-msg " + type;
    div.textContent = "> " + message;
    consoleBox.appendChild(div);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

async function getWeather(city) {
    logConsole("async getWeather('" + city + "') called", "async");
    logConsole("fetch() sent to Web API...", "async");

    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + API_KEY + "&units=metric"
    );

    logConsole("Promise resolved - response received", "promise");

    if (!response.ok) {
        alert("City not found!");
        throw new Error("City not found");
    }

    const data = await response.json();
    logConsole("JSON parsed for '" + data.name + "'", "promise");
    return data;
}

function showWeather(data) {
    weatherBox.innerHTML =
        '<div class="weather-item"><label>City</label><span>' + data.name + ", " + data.sys.country + "</span></div>" +
        '<div class="weather-item"><label>Temperature</label><span>' + data.main.temp + " °C</span></div>" +
        '<div class="weather-item"><label>Weather</label><span>' + data.weather[0].main + "</span></div>" +
        '<div class="weather-item"><label>Humidity</label><span>' + data.main.humidity + "%</span></div>" +
        '<div class="weather-item"><label>Wind Speed</label><span>' + data.wind.speed + " m/s</span></div>";
}

function saveHistory(city) {
    var history = JSON.parse(localStorage.getItem("weatherHistory"));
    if (history == null) {
        history = [];
    }
    if (history.indexOf(city) == -1) {
        history.unshift(city);
    }
    if (history.length > 5) {
        history.pop();
    }
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    logConsole("Callback: history saved to localStorage", "callback");
    loadHistory();
}

function deleteFromHistory(city) {
    var history = JSON.parse(localStorage.getItem("weatherHistory"));
    if (history != null) {
        history = history.filter(function(c) { return c !== city; });
        localStorage.setItem("weatherHistory", JSON.stringify(history));
        logConsole("Callback: removed '" + city + "' from history", "callback");
        loadHistory();
    }
}

function loadHistory() {
    var history = JSON.parse(localStorage.getItem("weatherHistory"));
    if (history == null) {
        history = [];
    }
    historyBox.innerHTML = "";
    for (var i = 0; i < history.length; i++) {
        var btn = document.createElement("button");
        btn.className = "history-city-btn";
        btn.setAttribute("data-city", history[i]);
        btn.innerHTML = history[i] + '<span class="delete-icon">✕</span>';
        btn.onclick = function(e) {
            if (e.target.closest(".delete-icon")) {
                e.stopPropagation();
                var c = this.getAttribute("data-city");
                deleteFromHistory(c);
                return;
            }
            var c = this.getAttribute("data-city");
            cityInput.value = c;
            search(c);
        };
        historyBox.appendChild(btn);
    }
}

async function search(city) {
    consoleBox.innerHTML = "";
    weatherBox.innerHTML = "";
    logConsole("search('" + city + "') pushed to Call Stack", "async");
    try {
        const data = await getWeather(city);
        showWeather(data);
        logConsole("Callback: showWeather() executed", "callback");
        saveHistory(data.name);
    } catch (err) {
        weatherBox.innerHTML = '<p style="color:red">' + err.message + '</p>';
        logConsole("Error: " + err.message, "callback");
    }
}

function clearHistory() {
    localStorage.removeItem("weatherHistory");
    logConsole("Callback: history cleared", "callback");
    loadHistory();
}

document.getElementById("searchBtn").onclick = function() {
    const city = cityInput.value.trim();
    if (city) {
        search(city);
    }
};



cityInput.addEventListener("keydown", function(e) {
    if (e.key == "Enter") {
        const city = cityInput.value.trim();
        if (city) {
            search(city);
        }
    }
});

loadHistory();