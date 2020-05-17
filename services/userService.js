const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Comment = db.Comment
const Followship = db.Followship
const bcrypt = require('bcryptjs')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
    signUpPage: (req, res, callback) => {
        callback({status: 'success', message: ''})
    },
    signUp: (req, res, callback) => {
        if (req.body.passwordCheck !== req.body.password) {
            return callback({ status: 'error', message: '兩次密碼輸入不同！' })
        } else {
            // confirm specific user
            User.findOne({ where: { email: req.body.email } }).then(user => {
                if (user) {
                    return callback({ status: 'error', message: '信箱重複！' })
                } else {
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
                    }).then(user => {
                        callback({ status: 'success', message: '成功註冊帳號！' })
                    })
                }
            })
        }
    },
    signInPage: (req, res, callback) => {
        callback({ status: 'success', message: '' })
    },
    signIn: (req, res, callback) => {
        callback({ status: 'success', message: '成功登入！' })
    },
    logout: (req, res, callback) => {
        req.logout()
        callback({ status: 'success', message: '登出成功！' })
    },
    getUser: (req, res, callback) => {
        User.findByPk(req.params.id, {
            include: [
                { model: Restaurant, as: 'FavoritedRestaurants' },
                { model: User, as: 'Followers' },
                { model: User, as: 'Followings' },
            ]
        })
            .then(user => {
                Comment.findAll({
                    where: { UserId: req.params.id },
                    raw: true,
                    nest: true,
                    include: [Restaurant]
                }).then(comments => {
                    user.FavoritedRestaurants = user.FavoritedRestaurants.map(r => r.dataValues)
                    user.Followers = user.Followers.map(u => u.dataValues)
                    user.Followings = user.Followings.map(u => u.dataValues)

                    callback({
                        user: user.toJSON(),
                        // data
                        FavoritedRestaurants: user.FavoritedRestaurants,
                        Followers: user.Followers,
                        Followings: user.Followings,
                        comments: comments,
                        // 數量
                        comments_length: comments.length,
                        FavoritedRestaurants_length: user.FavoritedRestaurants.length,
                        Followers_length: user.Followers.length,
                        Followings_length: user.Followings.length
                    })
                })
            })
    },
    editUser: (req, res, callback) => {
        User.findByPk(req.params.id)
            .then(user => {
               callback({ user: user.toJSON() })
            })
    },
    putUser: (req, res, callback) => {
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.user.id)
                    .then(user => {
                        user.update({
                            name: req.body.name,
                            image: file ? img.data.link : user.image,
                        }).then((user) => {
                            return callback({ status: 'success', message: 'User profile was successfully updated.' })
                        })
                    })
            })
        } else {
            return User.findByPk(req.params.id)
                .then(user => {
                    user.update({
                        name: req.body.name,
                    }).then((user) => {
                        return callback({ status: 'success', message: 'User profile was successfully updated.' })
                    })
                })
        }
    },
    addFavorite: (req, res, callback) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                callback({ status: 'success', message: '' })
            })
    },
    removeFavorite: (req, res, callback) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    },
    addLike: (req, res, callback) => {
        return Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                callback({ status: 'success', message: '' })
            })
    },
    removeLike: (req, res, callback) => {
        return Like.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((like) => {
                like.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    },
    getTopUser: (req, res, callback) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            callback({ users: users })
        })
    },
    addFollowing: (req, res, callback) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                callback({ status: 'success', message: '' })
            })
    },
    removeFollowing: (req, res, callback) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                .then((followship) => {
                    callback({ status: 'success', message: '' })
                })
            })
    }
}

module.exports = userService
