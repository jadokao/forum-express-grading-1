const userService = require('../../services/userService')

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

  putUser: (req, res) => {
    userService.putUser(req, res, data => {
      return res.json(data)
    })
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, data => {
      return res.json(data)
    })
  },

  addFavorite: (req, res) => {
    userService.addFavorite(req, res, data => {
      return res.json(data)
    })
  },

  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, data => {
      return res.json(data)
    })
  },

  addLike: (req, res) => {
    userService.addLike(req, res, data => {
      return res.json(data)
    })
  },

  removeLike: (req, res) => {
    userService.removeLike(req, res, data => {
      return res.json(data)
    })
  },

  addFollowing: (req, res) => {
    userService.addFollowing(req, res, data => {
      return res.json(data)
    })
  },

  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = userController
