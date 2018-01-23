var _ = require('lodash');


var config = {
     ipifyPublicHttpServiceQuery : "https://api.ipify.org?format=text",
     namesilo_target_domain : "---",
     namesilo_target_resource_host : "",
     namesilo_api_key : "",
     record_list_http_query_template : _.template("https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>"),
     update_http_query_template : _.template("https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>&rrid=<%- targetResourceId %>&rrhost=<%- targetResourceHost %>&rrvalue=<%- value %>&rrttl=7207 ")
    }

module.exports = config;
