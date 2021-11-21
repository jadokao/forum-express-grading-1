const bcrypt = require('bcryptjs')
const fs = require('fs')
const db = require('../models')
const userService = require('../services/userService')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    userService.signUp(req, res, data => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('/signup')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/signin')
    })
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    userService.signIn(req, res, data => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('/signin')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/restaurants')
    })
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
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

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, data => {
      return res.render('topUser', data)
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

module.exports = userController
