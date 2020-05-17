const db = require('../models')
const Comment = db.Comment
const commentService = require('../services/commentService')

let commentController = {
    postComment: (req, res) => {
        commentService.postComment(req, res, (data) => {
            if (data['status'] === 'success') {
                return res.redirect(`/restaurants/${req.body.restaurantId}`)
            } else {
                req.flash('error_messages', 'Try again!')            
                res.redirect(`/restaurants/${req.body.restaurantId}`)
            }       
        })
  },
    deleteComment: (req, res) => {
        commentService.deleteComment(req, res, (data) => {
            if (data['status'] === 'success') {
                console.log(data)
               return res.redirect(`/restaurants/${data.comment.RestaurantId}`)            
            } else {
                req.flash('error_messages', 'Try again!')
                return res.redirect(`/restaurants/${data.comment.RestaurantId}`)            
            }     
        })
    },
} 

module.exports = commentController