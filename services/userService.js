const bcrypt = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const helpers = require('../_helpers')

const userService = {
  signUp: (req, res, callback) => {
    if (req.body.passwordCheck !== req.body.password) {
      return callback({ status: 'error', message: '兩次密碼輸入不同！' })
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          return callback({ status: 'error', message: '信箱重複！' })
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return callback({ status: 'success', message: '成功註冊帳號！' })
          })
        }
      })
    }
  },

  signIn: (req, res, callback) => {
    // 檢查必要資料
    if (!req.body.email || !req.body.password) {
      return callback({ status: 'error', message: "required fields didn't exist" })
    }
    // 檢查 user 是否存在與密碼是否正確
    const username = req.body.email
    const password = req.body.password

    User.findOne({ where: { email: username } }).then(user => {
      if (!user) return callback({ status: 'error', message: 'no such user found' })
      if (!bcrypt.compareSync(password, user.password)) {
        return callback({ status: 'error', message: 'passwords did not match' })
      }
      // 簽發 token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return callback({
        status: 'success',
        message: '登入成功',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        }
      })
    })
  },

  getUser: async (req, res, callback) => {
    const whereQuery = {}
    whereQuery.UserId = req.params.id

    let user = await User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers', attributes: ['image', 'id'] },
        { model: User, as: 'Followings', attributes: ['image', 'id'] },
        { model: Restaurant, as: 'FavoritedRestaurants', attributes: ['image', 'id'] }
      ]
    })
    user.dataValues.isUser = req.user.id === Number(req.params.id)

    const isFollowed = user.Followers.map(d => d.id).includes(req.user.id)

    const commentData = await Comment.findAndCountAll({ include: [Restaurant], where: whereQuery })
    const restaurantData = commentData.rows
      .map(r => ({
        ...r.dataValues.Restaurant.dataValues
      }))
      .filter((now, index, array) => array.findIndex(target => target.id === now.id) === index)

    return callback({
      user: user.toJSON(),
      isFollowed,
      commentRestaurant: restaurantData,
      commentCount: restaurantData.length,
      favoriteRestaurant: user.FavoritedRestaurants,
      FavoriteCount: user.FavoritedRestaurants.length,
      followings: user.Followings,
      FollowingsCount: user.Followings.length,
      followers: user.Followers,
      FollowersCount: user.Followers.length
    })
  },

  putUser: (req, res, callback) => {
    if (req.user.id !== Number(req.params.id)) return callback({ status: 'error', message: '' })

    if (!req.body.name || !req.body.email) {
      return callback({ status: 'error', message: "name or email didn't exist" })
    }

    const { file } = req
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)

        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return User.findByPk(req.params.id).then(user => {
            user
              .update({
                name: req.body.name,
                email: req.body.email,
                image: file ? `/upload/${file.originalname}` : user.image
              })
              .then(user => {
                return callback({ status: 'success', message: '使用者資料編輯成功' })
              })
          })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user.update({ name: req.body.name, email: req.body.email, image: user.image }).then(user => {
          return callback({ status: 'success', message: '使用者資料編輯成功' })
        })
      })
    }
  },

  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return callback({ status: 'success', message: '' })
    })
  },

  removeFavorite: (req, res, callback) => {
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(() => callback({ status: 'success', message: '' }))
  },

  addLike: async (req, res, callback) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then(like => {
      return callback({ status: 'success', message: '' })
    })
  },

  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => res.redirect('back'))
  },

  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return callback({ users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      return res.redirect('back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = userService
