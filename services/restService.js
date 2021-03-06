const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

let restService = {
    getRestaurants: (req, res, callback) => {
        let offset = 0
        let whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (Number(req.query.page) - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery['categoryId'] = categoryId
        }
        Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
            // data for pagination
            let page = Number(req.query.page) || 1
            let pages = Math.ceil(result.count / pageLimit)
            let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            let prev = page - 1 < 1 ? 1 : page - 1
            let next = page + 1 > pages ? pages : page + 1
            // clean up restaurant data

            const data = result.rows.map(r => ({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                callback({
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category,
                { model: User, as: 'FavoritedUsers' },
                { model: User, as: 'LikedUsers' },
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
            const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
            callback({
                restaurant: restaurant.toJSON(),
                isFavorited: isFavorited,
                isLiked: isLiked
            })
        })
    },
    getFeeds: (req, res, callback) => {
        return Restaurant.findAll({
            limit: 10,
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
            include: [Category]
        }).then(restaurants => {
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            }).then(comments => {
                callback({
                    restaurants: restaurants,
                    comments: comments
                })
            })
        })
    },
    getDashBoard: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category, Comment]
        }).then(restaurant => {
            Comment.findAll({
                where: { RestaurantId: req.params.id },
                raw: true,
                nest: true
            }).then(comments => {
                let commentNum = comments.length
                callback({
                    restaurant: restaurant.toJSON(),
                    comments: comments,
                    commentNum
                })
            })
        })
    },
    getTopRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            include: [
                { model: User, as: 'FavoritedUsers' }
            ]
        }).then(restaurants => {
            restaurants = restaurants.map(restaurant => ({
                ...restaurant.dataValues,
                description: restaurant.dataValues.description.substring(0, 50),
                FavoritedCount: restaurant.FavoritedUsers.length,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id),
            }))
            restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount)
            restaurants = restaurants.slice(0, 10)
            callback({ restaurants: restaurants })
        })
    },
}

module.exports = restService