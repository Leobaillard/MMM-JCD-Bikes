/* Magic Mirror
 * Module: MMM-JCD-Bikes
 *
 * By leobaillard
 * Based upon: https://github.com/yo-less/MMM-nextbike
 * MIT Licensed.
 */

var parseString = require('xml2js').parseString;
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
            this.config = payload;
            this.returnData = {};
            for ( var i = 0, len = this.config.stations.length; i < len; i++ )
            {
                var api_url = this.config.apiBase + 'stations/' + this.config.stations[i] + this.getParams();
                this.getData(api_url);
            }
            this.sendSocketNotification("JCD BIKES", this.returnData);
        }
    },

	parseData: function(input) {
        stationData = JSON.parse(JSON.stringify(result));
        return stationData;
	},
	
	
    getData: function(options) {
		request(options, (error, response, body) => {
	        if (response.statusCode === 200) {
                var parsedStation = this.parseData(body);
                this.returnData[parsedStation.number] = parsedStation;
            } else {
                console.log("Error getting nextbike data " + response.statusCode);
            }
        });
    }
});
