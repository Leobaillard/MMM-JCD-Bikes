/* Magic Mirror
 * Module: MMM-JCD-Bikes
 *
 * By leobaillard https://github.com/leobaillard/MMM-JCD-Bikes
 * MIT Licensed.
 */

Module.register("MMM-JCD-Bikes", {
    getTranslations: function () {
        return {
            en: "translations/en.json",
            fr: "translations/fr.json"
        };
    },

    defaults: {
        fontSize: 9,
        voice: false,
        dimmed: false,

        jcdApiKey: "",
        jcdApiUrl: "https://api.jcdecaux.com/vls/v1/",
        jcdContract: "",
        jcdStations: [],

        reloadInterval: 60*1000
    },

    init: function() {
        this.stations = {};
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        var self = this;
        setInterval(function() {
            self.updateDom();
        }, this.config.reloadInterval);

        this.addStations(this.config.jcdApiUrl, this.config.jcdApiKey, this.config.jcdContract, this.config.jcdStations, this.config.reloadInterval);
    },

    getStyles: function() {
        return ["MMM-JCD-Bikes.css"];
    },

    getDom: function () {
        var wrapper = document.createElement("table");
        wrapper.innerHTML = this.config.text;
        wrapper.className = "small";

        var stations = this.createStationsList();
        
        if (stations.length === 0) {
            wrapper.innerHTML = (this.loaded) ? "No information" : "Loading...";
            wrapper.className = "small dimmed";
            return wrapper;
        }

        for (var s in stations) {
            var station = stations[s];
            var stationWrapper = document.createElement("tr");
            stationWrapper.className = "normal";

            /*if (this.config.displaySymbol) {
                var symbolWrapper = document.createElement("td");
                symbolWrapper.className = "symbol";
                var symbol = document.createElement("span");

                var symbolName = 
            }*/

            var titleWrapper = document.createElement("td");
            titleWrapper.innerHTML = station.name;
            titleWrapper.className = "title";
            stationWrapper.appendChild(titleWrapper);

            var standsWrapper = document.createElement("td");
            standsWrapper.innerHTML = station.bike_stands;
            standsWrapper.className = "bright align-center";
            stationWrapper.appendChild(standsWrapper);

            var availStandsWrapper = document.createElement("td");
            availStandsWrapper.innerHTML = station.available_bike_stands;
            availStandsWrapper.className = "bright align-center";
            stationWrapper.appendChild(availStandsWrapper);

            var availBikesWrapper = document.createElement("td");
            availBikesWrapper.innerHTML = station.available_bikes;
            availBikesWrapper.className = "bright align-center";
            stationWrapper.appendChild(availBikesWrapper);

            wrapper.appendChild(stationWrapper);
        }

        return wrapper;
    },

    addStations: function(url, key, contract, stations, reloadInterval) {
        this.sendSocketNotification("ADD_STATIONS", {
            url: url,
            key: key,
            contract: contract,
            stations: stations,
            reloadInterval: reloadInterval
        });
    },

    hasStations: function(stations) {
        if (this.config.jcdStations === stations) {
            return true;
        }

        return false;
    },

    createStationsList: function() {
        var stations = this.stations;
        if (stations === undefined) {
            return [];
        }
        
        return stations;
    },

    // Override socket notification handler
    socketNotificationReceived: function (notification, payload) {
        Log.info("Received: " + notification, payload);
        if (notification === "STATIONS_EVENTS") {
            if (this.hasStations(payload.stations)) {
                this.stations = payload.result;
                this.loaded = true;
            }
        } else if (notification === "FETCH_ERROR") {
            Log.error("MMM-JCD-Bikes Error. Could not fetch api: " + payload.url);
        } else if (notification === "INCORRECT_URL") {
            Log.error("MMM-JCD-Bikes Error. Incorrect url: " + payload.url);
        } else {
            Log.log("MMM-JCD-Bikes received an unknown socket notification: " + notification);
        }

        this.updateDom();
        this.show();
    },
});
