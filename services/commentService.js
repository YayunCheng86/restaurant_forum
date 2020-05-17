const db = require('../models')
const Comment = db.Comment

let commentService = {
    postComment: (req, res, callback) => {
        if (req.body.text !== '') {
            return Comment.create({
                text: req.body.text,
                RestaurantId: req.body.restaurantId,
                UserId: req.user.id
            })
                .then((comment) => {
                    callback({ status: 'success', message: '' })
                })
        } else {
            return res.redirect('back')
        }
    },
    deleteComment: (req, res, callback) => {
        Comment.findByPk(req.params.id)
            .then((comment) => {
                comment.destroy()
                    .then((comment) => {
                        callback({ status: 'success', message: '', comment: comment.toJSON() })
                    })
            })
    },
}

module.exports = commentService