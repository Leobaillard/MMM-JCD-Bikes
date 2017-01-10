/**
* Author: Léopold Baillard <leobaillard@leoserveur.org>
* Inspired by: MMM-nstreinen <https://github.com/qistoph/MMM-nstreinen>
*/

var Client = require("node-rest-client");

var StationFetcher = function(url, key, contract, stations, reloadInterval) {
    var self = this;

    var reloadTimer = null;
    var fetchedStations = {};

    var fetchFailedCallback = function() {};
    var stationsReceivedCallback = function() {};

    var opts = {
        mimetypes: {
            "json": ["application/json", "application/json;charset=utf-8"]
        }
    };

    var apiClient = new Client(opts);
    apiClient.registerMethod("getStationData", url + "stations/${id}", "GET");

    /* fetchStation()
     * Initiates stations fetch.
     */
    var fetchStation = function(id) {
        var args = {
            path: {"id": id},
            parameters: {
                apiKey: key,
                contract: contract
            }
        };
        apiclient.methods.getStationData(args, handleApiResponse).on("error", function(err) {
            fetchFailedCallback(self, "Error fetching station: " + err);
            console.log(err.stack);
        });
    };

    var fetchStations = function() {
        clearTimeout(reloadTimer);
        reloadTimer = null;

        stations.forEach(function(id) {
            self.fetchStation(id);
        });

        self.broadcastStations();
        scheduleTimer();
    };

    var handleApiResponse = function(data, response) {
        stationData = {};

        if (data === undefined) {
            fetchFailedCallback(self, "Received empty or invalid data.");
            return;
        }

        console.log(data);
        console.log(response);

        fetchedStations[id] = stationData;
    };

    /* scheduleTimer()
     * Schedule the timer for the next update.
     */
    var scheduleTimer = function() {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(function() {
            fetchStations();
        }, reloadInterval);
    };

    /* startFetch()
     * Initiate fetchStations();
     */
    this.startFetch = function() {
        fetchStations();
    };

    /* broadcastStations()
     * Broadcast the existing stations.
     */
    this.broadcastStations = function() {
        stationsReceivedCallback(self);
    };

    /* onReceive(callback)
     * Sets the on success callback
     *
     * argument clalback function - The on success callback
     */
    this.onReceive = function(callback) {
        stationsReceivedCallback = callback;
    };

    /* onError(callback)
     * Sets the on error callback
     *
     * argument callback function - The on error callback
     */
    this.onError = function(callback) {
        fetchFailedCallback = callback;
    };

    /* stations()
     * Returns the stations of this fetcher
     *
     * returns array - The stations of this fetcher
     */
    this.stations = function() {
        return this.stations;
    };

    /* url()
     * Returns the url of this fetcher.
     *
     * return string - The url of this fetcher.
     */
    this.url = function() {
        return url;
    };

    /* fetchedStations()
     * Returns current available stations for this fetcher
     *
     * returns array - The current available stations for this fetcher.
     */
    this.fetchedStations = function() {
        return fetchedStations;
    };
};

module.exports = StationFetcher;
