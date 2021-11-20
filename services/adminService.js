const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants })
    })
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      return callback({ restaurant: restaurant.toJSON() })
    })
  }
}

module.exports = adminController
