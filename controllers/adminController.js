const db = require('../models')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, data => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/create', { categories: categories })
    })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, data => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => {
      return res.render('admin/restaurant', data)
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          categories: categories,
          restaurant: restaurant.toJSON()
        })
      })
    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, data => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  getUsers: (req, res) => {
    adminService.getUsers(req, res, data => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.render('admin/users', { data })
    })
  },

  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, data => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/admin/users')
    })
  }
}

module.exports = adminController
