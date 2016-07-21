(function ($) { 
    
	$.WSClient = function (args) { 
          this.args = args;
    };
	
    $.WSClient.prototype = {
        //Open a websocket connection to scriptr and subscribe to a channel
        openConnection: function(onSuccess, onFailure) {
          	var socket = new WebSocket(this.args.config.url);
            var self = this;
            socket.onopen = function (event) {
                console.log("Socket opened",event)
                socket.send(JSON.stringify({
                    "method":"Subscribe",
                    "params":{
                        "channel": self.args.config.receive_channel
                    }
                }));
            }
			//When receiving a message on channel
            socket.onmessage = function(event) {
                try{
                  
                   var message = JSON.parse(event.data);
                   onSuccess(message)
                }catch(e){
                    console.log(e)
                }
            },
            socket.onClose = function(event) {
				console.log("Socket Closed",event)
            }
        }
    };
}(jQuery));




