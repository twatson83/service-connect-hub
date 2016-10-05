import prices from './data';
var Bus = require('service-connect');

console.log("Starting service");

var bus = new Bus({
    amqpSettings: {
        queue: { name: 'ServiceConnect.Samples.Ticker' },
        host: "amqp://guest:guest@localhost"
    }
});

bus.init(() => {

    bus.addHandler("latest-prices-request", (message, headers, type, replyCallback) => {
        var response = {
            prices: Object.keys(prices).map(k => {
                return { "symbol": k, "price": prices[k].price };
            })
        };
        replyCallback("latest-prices-response", response);
    });

    bus.addHandler("price-history-request", (message, headers, type, replyCallback) => {
        var response = {
            symbol: message.symbol,
            history: prices[message.symbol].history
        };
        replyCallback("price-history-response", response);
    });

    var nextPrice = symbol => {
        console.log(`Sending ${symbol} price`);

        var currentPrice = prices[symbol].price,
            d = currentPrice * 0.001,
            min = currentPrice - d,
            max  = currentPrice + d,
            price = +(Math.random() * (max - min) + min).toFixed(2),
            timestamp = new Date().toISOString();

        prices[symbol].price = price;
        prices[symbol].history.unshift({
            price,
            timestamp
        });

        bus.publish("new-price", {
            symbol,
            price,
            timestamp
        });
    };

    Object.keys(prices).forEach(k => setInterval(() => nextPrice(k), Math.random() * (2000 - 1000) + 1000));
});
