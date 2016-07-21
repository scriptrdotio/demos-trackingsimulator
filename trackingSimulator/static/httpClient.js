(function ($) { 
    
	$.HTTPClient = function (args) { 
          this.args = args;
    };
	
    $.HTTPClient.prototype = {
        //Build a scriptr http request object. If no params, use default config
        buildRequest: function(baseUrl, scriptName, token, parameters) {
            var config = this.args.config;
          	var options = {};
            var baseUrl = (baseUrl) ? baseUrl :config.baseUrl;
          	var scriptName = (scriptName) ? scriptName : config.dataScript;
          
            var search = window.location.search.substring(1);
			var params = (parameters) ? parameters : (search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) }) : {})

            var token = (token) ? token : ((params) ? params['auth_token'] : null);

            options = {
                type: "POST",
                url: baseUrl + "/" + scriptName,
                success: function() {},
                failure: function() {},
                dataType: "json",
                data: params //{ "device": device}
            };
            console.log(options);

            if(token) {
              	options["headers"] = { "Authorization":  "bearer " + token };
            }
            return options;
        },
       //Call a scriptr api, and use callback success and failure to channel response
		callApi: function(options, onSuccess, onFailure) {
            $.ajax(options).done(function(response) {
                 if(response.response.metadata.status == "failure") {
                   out += response.response.metadata.errorCode+": "+response.response.metadata.errorDetail;
                 } else {
                   onSuccess(response.response.result);
                 }
            }).fail(function(response){
              var out = "";
              if(response.status == 0 && response.statusText == "error" && response.readyState == 0 && response.responseText == ""){
                 out += "An error has occurred. This is most likely a cross-domain issue."
                 out += "In case you modified the response object in your script, try adding response.addHeaders(configuration.crossDomainHeaders) to your code.";
                 onFailure(out);
              }else{
                var output = response;
                if(response.responseJSON){
                    out += "Your data source script returned a "+ response.responseJSON.response.metadata.errorCode + " error.";
                  	onFailure(out);
                }
              }
            }).always(function(response){

            })
		}
    };
}(jQuery));




