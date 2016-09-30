var Bus = require('service-connect');

console.log("Starting Sender");

var bus = new Bus({
    amqpSettings: {
        queue: { name: 'ServiceConnect.Samples.Sender' },
        host: "amqp://guest:guest@localhost"
    }
});

bus.init(function(){
    var logCount = 0,
        metricCount = 0;

    setInterval(function(){
        console.log("Sending Log command");
        logCount++;
        bus.publish("LogCommand", { Message: "Log "+ logCount, Level: logCount % 2 ? "Info" : "Debug" });
    }, 1000);

    setInterval(function(){
        console.log("Sending Metric command");
        metricCount++;
        bus.publish("MetricCommand", { Message: "Metric " + metricCount});
    }, 2000);
});





