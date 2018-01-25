# Simple Namesilo Nodejs Dynamic Domain Name System

This javascript program implements the [http API](https://www.namesilo.com/api_reference.php) from [namesilo](https://www.namesilo.com/) to update the value of  an  "_Existing Resource Record_ "  with your public ip address, polling it from [ipyfy](https://www.ipify.org) public service. 

## Requires

This script was developed and tested using:

* nodejs >= 4.5.6 
* npm >= 3.5.2
* [namesilo api key](https://www.namesilo.com/Support/API-Manager) 

## Install


Clone the repository .
```
git clone https://github.com/lemyskaman/namesilo_ddns_record_updater.git

cd namesilo_ddns_record_updater
```

Install all node modules.
```
npm install 
```
Rename the file example_config.js to config.js. 
On linux you can do that with the next command:
```
mv config_example.js config.js 
```

Edit the file config.js filling the empty ("") config properties.
Take this as an example:
```javascript
var _ = require('lodash');


var config = {
     ipifyPublicHttpServiceQuery : "https://api.ipify.org?format=text",
     ipifyPollPeriod:"10000",//milisecs
     namesilo_target_domain : "kamansoft.com", //your main domain
     namesilo_target_resource_host : "test.kamanasoft.com", //a target value update subdomain
     namesilo_api_key : "b2fdef38c2932a3eb47f", //you must get an ip key from namesilo
     record_list_http_query_template : _.template("https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>"),
     update_http_query_template : _.template("https://www.namesilo.com/api/dnsUpdateRecord?version=1&type=xml&key=<%- apiKey %>&domain=<%- targetDomain %>&rrid=<%- targetResourceId %>&rrhost=<%- targetResourceHost %>&rrvalue=<%- value %>&rrttl=7207 ")
    }

module.exports = config;
```


## Usage

If everything above is ok the just run the script.
```
npm start 
```

