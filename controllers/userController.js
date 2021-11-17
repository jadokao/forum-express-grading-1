const bcrypt = require('bcryptjs')
const fs = require('fs')
const db = require('../models')
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
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    // 篩選Comment的依據：Comment裡面的UserId
    const whereQuery = {}
    whereQuery.UserId = req.params.id

    const userData = {}
    User.findByPk(req.params.id, { raw: true }).then(user => {
      userData.id = user.id
      userData.name = user.name
      userData.email = user.email
      userData.image = user.image
      userData.isUser = req.user.id === Number(req.params.id)
    })

    // include >> 提取跟Comment所連結的table：Restaurant
    return Comment.findAndCountAll({ include: [Restaurant], where: whereQuery }).then(result => {
      // 把餐廳資料形成一個個object，放進Array之中
      const restaurantData = result.rows.map(r => ({
        ...r.dataValues.Restaurant.dataValues
      }))
      res.render('profile', { user: userData, count: result.count, restaurants: restaurantData })
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
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
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
