var Promise = require('bluebird'),
  lodash = require('lodash');

module.exports = {
  addPaginateFunction: function(model) {

    model.findPaginate = function(requestQuery, query)  {
      return new Promise(function(resolve, reject) {

        var page = requestQuery.page,
        count = requestQuery.count,
        sorting = requestQuery.sorting || {},
        filter = requestQuery.filter || {};

        var order = [];
        Object.keys(sorting).forEach(function(key) {
          order.push(key + ' ' + (sorting[key] == 'asc' ? 'ASC' : 'DESC'));
        });

        var where = {};

        Object.keys(filter).forEach(function(key) {
          where[key] = {
            like: filter[key]
          };
        });

        var params = lodash.merge({
          where: where,
          order: order.join(', '),
          limit:count,
          skip: (page - 1) * count
        }, query);

        model.all(params, function(error, models) {
          if (error) {
            return reject(error);
          }
          model.count(where, function(error, count) {
            if (error) {
              return reject(error);
            }

            resolve({
              total: count,
              result: models
            });
          });
        });
      });
    };
  }
};

