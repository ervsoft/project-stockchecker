'use strict';

module.exports = function (app) {
  const axios = require('axios');

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stocks = req.query.stock;
      const like = req.query.like;
      console.log(stocks, like);
      const requests = Array.isArray(stocks) ? stocks.map(stock => {
        return axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
      }) : [axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`)];

      Promise.all(requests)
        .then(results => {
          const stockData = results.map(result => {
            const stockSymbol = result.data.symbol;
            const price = Number(result.data.latestPrice);
            const likes = result.data.iexVolume ? 1 : 0;
            const likeCond = Array.isArray(stocks) ? "rel_likes" : "likes";
            return { stock: stockSymbol, price: price, [likeCond]: likes };
          });
          if (stockData.length === 2) {
            stockData[0].rel_likes = stockData[0].likes - stockData[1].likes;
            stockData[1].rel_likes = stockData[1].likes - stockData[0].likes;
          }
          res.json({ stockData: stockData });
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('Error retrieving stock prices');
        });
    });
};
