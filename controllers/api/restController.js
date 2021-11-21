const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User

const restService = require('../../services/restService')

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = restController
