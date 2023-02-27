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
            const price = result.data.latestPrice;
            const likes = like ? 1 : 0;
            return { stock: String(result.data.symbol), price, likes };
          });
          res.json({ stockData });
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('Error retrieving stock prices');
        });




    });

};
