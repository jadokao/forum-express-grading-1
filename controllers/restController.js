const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const helpers = require('../_helpers')

const restService = require('../services/restService')

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      return res.render('restaurants', data)
    })
  },

  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => {
      return res.render('restaurant', data)
    })
  },

  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => {
      return res.render('feeds', data)
    })
  },

  getDashBoard: async (req, res) => {
    const whereQuery = {}
    whereQuery.RestaurantId = req.params.id

    return Promise.all([
      Comment.findAndCountAll({ include: [Restaurant], where: whereQuery }),
      Restaurant.findByPk(req.params.id, {
        include: [Category, { model: Comment, include: [User] }]
      })
    ]).then(([comments, restaurant]) => {
      const commentNumber = comments.count
      res.render('dashboard', { restaurant: restaurant.toJSON(), commentNumber })
    })
  },

  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, data => {
      return res.render('topRestaurants', data)
    })
  }
}
module.exports = restController
