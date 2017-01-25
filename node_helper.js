/*jshint esversion: 6*/
/* Magic Mirror
 * Module: MMM-JCD-Bikes
 *
 * By leobaillard
 * Based upon: https://github.com/yo-less/MMM-nextbike
 * MIT Licensed.
 */

const request = require('request');
const NodeHelper = require("node_helper");



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

	
	/* getParams
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	
	getParams: function() {
        var params = "?contract=";
        params += this.config.contract;
        params += "&apiKey=";
        params += this.config.apiKey;
        return params;
	},
	
    socketNotificationReceived: function(notification, payload) {
        if(notification === 'CONFIG'){
            console.log("[JCD Bikes] CONFIG event received");
            this.config = payload;
            this.returnData = {};
            console.log("[JCD Bikes] Getting stations data");
            for ( var i = 0, len = this.config.stations.length; i < len; i++ )
            {
                var notify = (i == (len -1)) ? true : false;
                console.log("[JCD Bikes] --> Station " + this.config.stations[i] + "...");
                var api_url = this.config.apiBase + 'stations/' + this.config.stations[i] + this.getParams();
                console.log("[JCD Bikes] --> URL : " + api_url);
                if (notify)
                    console.log("[DEBUG] Last station, will notify");
                this.getData(api_url, notify);
            }

        }
    },

	parseData: function(input) {
        stationData = JSON.parse(JSON.stringify(input));
        return stationData;
	},
	
	
    getData: function(options, notify = false) {
		request(options, (error, response, body) => {
            console.log("[JCD Bikes] --> Request made (" + response.statusCode + ")");
	        if (response.statusCode === 200) {
                var parsedStation = this.parseData(body);
                this.returnData[parsedStation.number] = parsedStation;
            } else {
                console.log("Error getting JCD station data " + response.statusCode);
            }

            if (notify)
            {
                console.log("[DEBUG] Notifying...");
                this.sendSocketNotification("JCD_BIKES", this.returnData);
            }
        });
    }
});
