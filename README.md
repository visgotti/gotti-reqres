Low level and lightweight messaging library that wraps around ZMQ sockets to create an API that is used in Centrum.

Simple request/response servers:

   Originally the broker would have been a normal parameter to the Messenger constructor, but now
   the idea is to put it inside your options if you're using a messenger that needs it. So since both
   request and response messengers use it, 'brokerURI' must be in the options and will throw an error
   if you don't provide one. Same thing for the server Ids now. They will be passed in from the options.

      var requestMessengerOptions = {
        id: "requestMessengerServer"
        brokerURI: brokerURI,
        request:
         { timeout: 1000 }  // defaults to 5000 (milliseconds)
      };

      var responseMessengerOptions = {
        id: "responseMessengerServer"
        brokerURI: brokerURI,
        response: true, // still no additional configurations needed so just use a boolean.
      };


   create the instances of each server. These should normally live on different processes at the least.
   each use a zmq dealer socket so they both need the brokerURI for routing purposes. You still need
   to manually start up a broker instance with the URI passed into response/request for them to work.

      var broker = new Broker(brokerURI, "brokerId");

      var requestServer = new Messenger(requestMessengerOptions);

      var responseServer = new Messenger(responseMessengerOptions);


   now when you want to create your request

      // request name, response server id, hook/data

      requestServer.createRequest("foo", "responseMessengerServer")

   now called like

      requestServer.requests.foo(10);

   it's asynchronous so to get the response either

      const response = await requestServer.requests.foo(10);

   Creating the response

   "request" parameter in the function is whatever was passed into the foo request function, so 10 in this instance.

   The response will process the request * 5 in its handler, and whatever it returns gets sent back
   to the response server asynchronously

      responseServer.createResponse("foo", function(request) { return request * 5 });


   So now when you call....

      await response = requestServer.requests.foo(10);

      console.log(response) //50
