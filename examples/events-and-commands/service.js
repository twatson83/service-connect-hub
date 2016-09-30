var Bus = require('service-connect');

console.log("Starting Sender");

var bus = new Bus({
    amqpSettings: {
        queue: { name: 'SampleServiceConnectHubService' },
        host: "amqp://guest:guest@localhost"
    }
});

bus.init(function() {

    bus.addHandler("SampleCommand", function(message, headers, type){
        console.log("*************************");
        console.log("Received sample command");
        console.log("Message = " + JSON.stringify(message));
        console.log("Type = " + type);
        console.log("");

        bus.send("ServiceConnectWeb.EventsAndCommands", "ClientMessage", {
            Message: "Received sample command"
        });
    });

    bus.addHandler("SampleEvent", function(message, headers, type){
        console.log("*************************");
        console.log("Received sample event");
        console.log("Message = " + JSON.stringify(message));
        console.log("Type = " + type);
        console.log("");

        bus.send("ServiceConnectWeb.EventsAndCommands", "ClientMessage", {
            Message: "Received sample event"
        });
    });

});







