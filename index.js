/**
 * Node.js eBay Trading API client
 * https://github.com/demchig/node-ebay-trading-api
 *
 * Copyright (c) 2014 Demchig, Batchuluun
 */

 (function() {

    var Client = require('node-rest-client').Client;
    var xml2js = require('xml2js');
    var fs = require('fs');
    var util = require("util");

    client = new Client();

    // registering remote methods
    client.registerMethod("xmlMethod", "https://api.ebay.com/ws/api.dll", "POST");

    var args = {
        headers : {
            "X-EBAY-API-CALL-NAME" : "GetItem",
            "X-EBAY-API-SITEID" : 0,
            "X-EBAY-API-COMPATIBILITY-LEVEL" : 870,
            "Content-Type" : "text/xml"
        },
        data : ''
    };

    var userToken = '';
    var xEbayApiAppName = '';
    var xEbayApiDevName = '';
    var xEbayApiCertName = '';
    var userXmlStringAlreadyDefined = '';


    exports.setUserToken = function(token){
        userToken = token;
    };

    exports.setCredentials = function(xEbayApiAppName, xEbayApiDevName, xEbayApiCertName){
        userXEbayApiAppName = xEbayApiAppName;
        userXEbayApiDevName = xEbayApiDevName;
        userXEbayApiCertName = xEbayApiCertName;
    };


    // the xml string is already received, it needs only to be appended to the credentials nodes
    exports.setXmlStringAlreadyDefined = function(xmlStringAlreadyDefined){
        userXmlStringAlreadyDefined = xmlStringAlreadyDefined;
    };


    exports.getUserToken = function(){
        return userToken;
    };



    exports.call = function(callName, jsonObj, callback){

      if(! userXmlStringAlreadyDefined){

        if( ! userToken ){

        args.headers["X-EBAY-API-APP-NAME"] = userXEbayApiAppName;
        args.headers["X-EBAY-API-DEV-NAME"] = userXEbayApiDevName;
        args.headers["X-EBAY-API-CERT-NAME"] = userXEbayApiCertName;
        args.headers["X-EBAY-API-CALL-NAME"] = callName;
        args.data = buildXmlNoAuth(callName, jsonObj);

        client.methods.xmlMethod(args, function(data,response){

            xml2js.parseString(data, function(err, result){
                callback(result);
            });

        });


        }else{

        args.headers["X-EBAY-API-CALL-NAME"] = callName;
        args.data = buildXmlData(callName, jsonObj);

        client.methods.xmlMethod(args, function(data,response){
            // parsed response body as js object
            //console.log(data);
            // raw response
            //console.log(response);

            xml2js.parseString(data, function(err, result){
                //inspect(result);
                callback(result);
            });

        });

        }

      }else{

        /* Here receive the xml string directly and append it to the credentials nodes */
        var xmlStringSent = userXmlStringAlreadyDefined;
        args.headers["X-EBAY-API-CALL-NAME"] = callName;
        args.data = buildXmlWithStringAlreadyReceived(callName, xmlStringSent);

        client.methods.xmlMethod(args, function(data,response){

            xml2js.parseString(data, function(err, result){
                //inspect(result);
                callback(result);
            });

        });

        /* Reset the variable xmlStringAlreadyDefined in the scope after the call was done
         * Otherwise all the other calls will crash.
         */
        xmlStringAlreadyDefined = '';
      }


    };


    /* ----------------------------------------------------------------
     * functions
     ----------------------------------------------------------------*/
     function buildXmlData(callName, jsonObj)
     {
        var builder = new xml2js.Builder({ headless : true });
        var xmlStr = builder.buildObject(jsonObj);

        xmlStr = xmlStr.replace('<root>', '');
        xmlStr = xmlStr.replace('</root>', '');

        var xmlData = '<?xml version="1.0" encoding="utf-8"?>'
        + '<' + callName + 'Request xmlns="urn:ebay:apis:eBLBaseComponents">'
        + '<RequesterCredentials> <eBayAuthToken>'
        + userToken + '</eBayAuthToken> </RequesterCredentials>'
        + xmlStr
        + ' </' + callName + 'Request>';
        //console.log(xmlData);
        return xmlData;
    }


    function buildXmlNoAuth(callName, jsonObj)
     {
        var builder = new xml2js.Builder({ headless : true });
        var xmlStr = builder.buildObject(jsonObj);

        xmlStr = xmlStr.replace('<root>', '');
        xmlStr = xmlStr.replace('</root>', '');

        var xmlData = '<?xml version="1.0" encoding="utf-8"?>'
        + '<' + callName + 'Request xmlns="urn:ebay:apis:eBLBaseComponents">'
        + xmlStr
        + ' </' + callName + 'Request>';

        //console.log(xmlData);
        return xmlData;
    }

    function buildXmlWithStringAlreadyReceived(callName, userXmlStringAlreadyDefined)
     {
        var builder = new xml2js.Builder({ headless : true });
        var xmlStr = userXmlStringAlreadyDefined;

        var xmlData = '<?xml version="1.0" encoding="utf-8"?>'
        + '<' + callName + 'Request xmlns="urn:ebay:apis:eBLBaseComponents">'
        + '<RequesterCredentials> <eBayAuthToken>'
        + userToken + '</eBayAuthToken> </RequesterCredentials>'
        + xmlStr
        + ' </' + callName + 'Request>';

        // console.log(xmlData);
        return xmlData;
    }


    function inspect(value)
    {
        console.log(util.inspect(value, false, null));
    }

}).call(this);
