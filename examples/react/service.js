var Bus = require('service-connect');
var Chance = require('chance');

console.log("Starting Sender");

var bus = new Bus({
    amqpSettings: {
        queue: { name: 'ServiceConnect.Samples.Sender' },
        host: "amqp://guest:guest@localhost"
    }
});

bus.init(function(){
    var logCount = 0;

    var chance = new Chance();

    setInterval(function(){
        console.log("Sending Log command");
        logCount++;
        bus.publish("LogCommand", {
            Id: logCount,
            Message: chance.sentence(),
            Level: logCount % 2 ? "Info" : "Debug",
            DateTime: new Date().toISOString()
        });
    }, 200);
});





