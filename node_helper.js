var NodeHelper = require("node_helper");
var StationFetcher = require("./stationfetcher.js");

module.exports = NodeHelper.create({
    // Override start method
    start: function() {
        var self = this;
        var events = [];

        this.fetchers = [];

        console.log("Starting node helper for: " + this.name);
    },

    // Override socketNotificationReceived method
    socketNotificationReceived: function(notification, payload) {
        if (notification === "ADD_STATIONS") {
            this.createFetcher(payload.url, payload.key, payload.contract, payload.stations, payload.reloadInterval);
        }
    },

    /* createFetcher(url, key, contract, stations, reloadInterval)
     * Creates a fetcher for stations if it doesn't exist yet.
     * Otherwise it reuses the existing one.
     *
     * attribute service string - A short service name
     * attribute url string - The web API url
     * attribute key string - The API key
     * attribute contract string - The JCD contract number
     * attribute stations array - An array of station IDs to fetch
     * attribute reloadIntervall - Reload interval in milliseconds
     */
    createFetcher: function(service, url, key, contract, stations, reloadInterval) {
        var self = this;

        var fetcher;
        if (typeof self.fetchers[service] === "undefined") {
            console.log("Create new stations fetcher for service: " + service + " - Interval: " + reloadInterval);
            fetcher = new StationFetcher(url, key, contract, stations, reloadInterval);

            fetcher.onReceive(function(fetcher) {
                self.sendSocketNotification("STATIONS_EVENTS", {
                    stations: fetcher.stations(),
                    result: fetcher.fetchedStations()
                });
            });

            fetcher.onError(function(fetcher, error) {
                self.sendSocketNotification("FETCH_ERROR", {
                    stations: fetcher.stations(),
                    error: error
                });
            });

            self.fetchers[service] = fetcher;
        } else {
            console.log("Use existing stations fetcher for service: " + service);
            fetcher = self.fetchers[service];
            fetcher.broadcastStations();
        }

        fetcher.startFetch();
    }
});
