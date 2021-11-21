const db = require('../../models')
const User = db.User

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const userService = require('../../services/userService')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: (req, res) => {
    userService.signIn(req, res, data => {
      return res.json(data)
    })
  },

  signUp: (req, res) => {
    userService.signUp(req, res, data => {
      return res.json(data)
    })
  },

  getUser: (req, res) => {
    userService.getUser(req, res, data => {
      return res.json(data)
    })
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = userController
