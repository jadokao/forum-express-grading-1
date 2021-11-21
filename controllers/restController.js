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
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts')

      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited: isFavorited,
        isLiked: isLiked
      })
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
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    }).then(result => {
      const restaurants = result
        .map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          favoritedCount: r.dataValues.FavoritedUsers.length,
          isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id)
        }))
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)
      return res.render('topRestaurants', { restaurants })
    })
  }
}
module.exports = restController
