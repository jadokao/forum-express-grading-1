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
        message: 'ok',
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

  getUser: async (req, res) => {
    // 篩選Comment的依據：Comment裡面的UserId
    const whereQuery = {}
    whereQuery.UserId = req.params.id

    // 取得User的資料，包含favorite, following, follower資料
    let user = await User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers', attributes: ['image', 'id'] },
        { model: User, as: 'Followings', attributes: ['image', 'id'] },
        { model: Restaurant, as: 'FavoritedRestaurants', attributes: ['image', 'id'] }
      ]
    })
    user.dataValues.isUser = req.user.id === Number(req.params.id)

    const isFollowed = user.Followers.map(d => d.id).includes(req.user.id)

    // 已評論的餐廳
    const commentData = await Comment.findAndCountAll({ include: [Restaurant], where: whereQuery })
    const restaurantData = commentData.rows
      .map(r => ({
        ...r.dataValues.Restaurant.dataValues
      }))
      .filter((now, index, array) => array.findIndex(target => target.id === now.id) === index)

    return res.render('profile', {
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

  editUser: (req, res) => {
    if (req.user.id !== Number(req.params.id)) return res.redirect('back')

    return User.findByPk(req.params.id, { raw: true }).then(user => {
      res.render('edit', { user })
    })
  },

  putUser: (req, res) => {
    if (req.user.id !== Number(req.params.id)) return res.redirect('back')

    if (!req.body.name || !req.body.email) {
      req.flash('error_messages', "name or email didn't exist")
      return res.redirect('back')
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
                req.flash('success_messages', '使用者資料編輯成功')

                return res.redirect(`/users/${req.params.id}`)
              })
          })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user.update({ name: req.body.name, email: req.body.email, image: user.image }).then(user => {
          req.flash('success_messages', '使用者資料編輯成功')

          return res.redirect(`/users/${req.params.id}`)
        })
      })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(restaurant => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(() => res.redirect('back'))
  },

  addLike: async (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then(like => {
      return res.redirect('back')
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
