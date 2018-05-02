var _ = require('lodash');


var config = {

     ipifyPublicHttpServiceQuery : "https://api.ipify.org?format=text",
     ipifyPollPeriod:"10000",//milisecs
     namesilo_target_domain : "kamansoft.com",
     namesilo_target_resource_host : "lab",
     namesilo_api_key : "b2fdae37c2932c3eb47f",
     record_list_http_query_template : _.template("https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>"),
     update_http_query_template : _.template("https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>&rrid=<%- targetResourceId %>&rrhost=<%- targetResourceHost %>&rrvalue=<%- value %>&rrttl=7207 ")
    }

module.exports = config;
