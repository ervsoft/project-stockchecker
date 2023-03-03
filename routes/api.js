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
          let stockData = results.map(result => {
            const stockSymbol = String(result.data.symbol);
            const price = Number(result.data.latestPrice);
            const likes = Number(result.data.iexVolume || 1);
            return { stock: stockSymbol, price: price, likes };
          });

          if (like) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const ips = like.split(',');
            stockData = stockData.map(stock => {
              if (ips.includes(ip) && stock.likes === 1) {
                stock.likes++;
              }
              return stock;
            });
          }

          if (stockData.length === 2) {
            const rel_likes = stockData[0].likes - stockData[1].likes;
            stockData[0].rel_likes = rel_likes;
            stockData[1].rel_likes = -rel_likes;
            delete stockData[0].likes;
            delete stockData[1].likes;
          }

          res.json({ stockData: Array.isArray(stocks) ? stockData : stockData[0] });
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('Error retrieving stock prices');
        });
    });
};
