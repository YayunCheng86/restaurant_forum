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

const userController = {
    signUpPage: (req, res) => {
        return res.render('signup')
    },
    signUp: (req, res) => {
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

                // console.log(comments)
                // console.log(user.FavoritedRestaurants)
                // console.log(user.Followers)
                // console.log(user.Followings)

                return res.render('profile', {
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
    editUser: (req, res) => {
        User.findByPk(req.params.id)
        .then(user => {
            return res.render('editProfile', { user: user.toJSON() })
        })
    },
    putUser: (req, res) => {        
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
                        req.flash('success_messages', 'User profile was successfully updated.')
                        return res.redirect(`/users/${req.user.id}`)
                    })
                })
            })
        } else {
            return User.findByPk(req.params.id)
            .then(user => {
                user.update({
                    name: req.body.name,
                }).then((user) => {
                    req.flash('success_messages', 'User profile was successfully updated.')
                    return res.redirect(`/users/${req.user.id}`)
                })
            })    
        }
    },
    addFavorite: (req, res) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return res.redirect('back')
            })
    },
    removeFavorite: (req, res) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
        .then((favorite) => {
            favorite.destroy()
                .then((restaurant) => {
                    return res.redirect('back')
                })
            })
    },
    addLike: (req, res) => {
        return Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
        .then((restaurant) => {
            return res.redirect('back')
        })
    },
    removeLike: (req, res) => {
        console.log(req.params.restaurantId, 'r.id')

        return Like.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
        .then((like) => {
            console.log(like)
            like.destroy()
            .then((restaurant) => {
                return res.redirect('back')
            })
        })
    },
    getTopUser: (req, res) => {
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
            return res.render('topUsers', { users: users })
        })
    },
    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                return res.redirect('back')
            })
    },
    removeFollowing: (req, res) => {
        return Followship.findOne({
            where: {
                followerId: req.user.id,
                followingId: req.params.userId
            }
        })
            .then((followship) => {
                followship.destroy()
                    .then((followship) => {
                        return res.redirect('back')
                    })
            })
    }
}

module.exports = userController