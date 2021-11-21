const commentService = require('../../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, data => {
      return res.json(data)
    })
  }
}

module.exports = commentController
