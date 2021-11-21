const db = require('../models')
const Comment = db.Comment

const commentService = require('../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, data => {
      if (data.status === 'success') return res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
  },

  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id).then(comment => {
      comment.destroy().then(comment => {
        res.redirect(`/restaurants/${comment.RestaurantId}`)
      })
    })
  }
}

module.exports = commentController
