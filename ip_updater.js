var Promise = require('bluebird')
var _ = require('lodash');
var request = require('request');
var parseString = require('xml2js').parseString;
var request = Promise.promisify(request);//we make hhtp request promises compatible
var parseString = Promise.promisify(parseString);//making promises compatible to xml parsinf function
var config = require('./config')

//var log = new Log('debug', fs.createWriteStream('ip_check.log',{'flags': 'a'}));

//var config.ipifyPublicHttpServiceQuery = "https://api.ipify.org?format=text";
//var config.namesilo_target_domain = "kamansoft.com";
//var namesilo_target_resource_host = "lab"
//var namesilo_api_key = "b2fdae37c2932c3eb47f";
//var config.record_list_http_query_template = _.template("https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>")
//var config.update_http_query_template = _.template("https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>&rrid=<%- targetResourceId %>&rrhost=<%- targetResourceHost %>&rrvalue=<%- value %>&rrttl=7207 ")



function ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return (true)
    }

    return (false)
}




/**
 * this function is a wrapping for a promised request function
 * as i want the promise to be rejected if the http respónse status isnt 200
 * this resolves a request response
 * @param queryUrl String, the url to request from some server
 * @returns Promise
 */
function httpApiRequest(queryUrl) {
    return new Promise(function (resolve, reject) {
        //requesting
        //console.log(queryUrl.split("/"))
        var splitedQuery=queryUrl.split("/")
        var urlDomain = splitedQuery[2];
        console.log("atempt http request to: " + urlDomain)
        //console.log("full query: "+queryUrl )
        request(queryUrl, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                console.log("succes conecction to: " + urlDomain)
                if (res.statusCode === 200) {
                    resolve(body)
                } else {
                    reject({ message: "no 200 status code on " + urlDomain + " request", response: response.toJSON })
                }
            }

        })
    })
}


function namesiloApiPromisedReplyHandler(parsedResponseBody) {
    return new Promise(function (resolve, reject) {
        //console.log("handler "+parsedResponseBody.namesilo.reply[0].code[0])
        if (parsedResponseBody.namesilo.reply[0].code[0] === '300' || parsedResponseBody.namesilo.reply[0].code[0] === '301') {
            resolve(parsedResponseBody)
        } else {
            reject({ message: "non valid dns api response code", resposeReply: parsedResponseBody.namesilo.reply[0] })
        }
    })

}

/**
 * checkValidRecord cheks for  a record on a recordlist
 * @param recordList array with all elements to search on
 * @param record String element to find on recordList
 * @returns the found value or false  
 */
function isValidRecord(record, recordList) {
    var result = _.find(recordList,
        {
            type: ['A'],
            host: [record]
        }
    );
    if (result !== undefined) {
        return result
    } else {
        return false
    }
}

/**
 * ipUdater this function will do the main job, to update a namesilo record matching the value of fullNamesiloTargetHost
 * param with one of the element on the recordlist 
 * 
 */
function ipUpdater(recordList, ipToTargetHost, resourceHost) {

    var target_record_data = isValidRecord(resourceHost+ "." + config.namesilo_target_domain, recordList);

    if (target_record_data) {
        var ipSetedOnTargetHost = target_record_data.value[0];
        var targetResourceId = target_record_data.record_id[0];

        console.log("server public ip is: " + ipToTargetHost + " and namesilo host record ip value is : " + ipSetedOnTargetHost)
        if (ipToTargetHost !== ipSetedOnTargetHost) {
            httpApiRequest(config.update_http_query_template(
                {
                    apiKey: config.namesilo_api_key,
                    targetDomain: config.namesilo_target_domain,
                    targetResourceId: targetResourceId,
                    targetResourceHost: resourceHost,
                    value: ipToTargetHost

                }))
                .then(function (result) {
                    
                    return parseString(result)
                })
                .then(function(result){
                    return namesiloApiPromisedReplyHandler(result)
                })
                .then(function(result){
                    console.log("record value for "+resourceHost+ "." + config.namesilo_target_domain+" succesfully updated")
                    //console.log(result.namesilo.reply[0])
                    
                })
                .catch(function (err) {
                    console.log(err)
                    //log.error(err) 
                })

        } else {
            //console.log("no change on ip")
            console.log("there is no need to update "+resourceHost+ "." + config.namesilo_target_domain+". Public ip and reosurce record value ip are equals")
        }
    } else {
        console.log(resourceHost+ "." + config.namesilo_target_domain+" is not a valid record on namesilo")
    }



}




function main() {

    httpApiRequest(config.record_list_http_query_template({
        apiKey: config.namesilo_api_key,
        targetDomain: config.namesilo_target_domain
    }))
        .then(function (result) {
            return parseString(result)
        })
        .then(function (result) {
            return namesiloApiPromisedReplyHandler(result)
        })
        .then(function (result) {
            return Promise.all([result, httpApiRequest(config.ipifyPublicHttpServiceQuery)])
        })
        .then(function (results) {
            var ipToTargetHost = results[1];
            if (ValidateIPaddress(ipToTargetHost)) {
                var recordList = results[0].namesilo.reply[0].resource_record;

                var promisedRecords = _.map(config.namesilo_target_resource_hosts, function (v, k, l) {
                    
                    ipUpdater(recordList,ipToTargetHost,v);
                }, this)

            } else {
                return Promise.reject("the retrived public ip addres isnt in a valid format")
            }

        })        
        .catch(function (err) {
            console.log(err)
            //log.error(err) 
        })
}


setInterval(main, config.ipifyPollPeriod);

