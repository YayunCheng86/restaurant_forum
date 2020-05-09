const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10
let restController = {
    getRestaurants: (req, res) => {
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
                categoryName: r.Category.name
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                return res.render('restaurants', {
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
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            include: [
                Category, 
                { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            restaurant.increment('viewCounts')
            return res.render('restaurant', {
                restaurant: restaurant.toJSON()
            })
        })
    },
    getFeeds: (req, res) => {
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
                return res.render('feeds', {
                    restaurants: restaurants,
                    comments: comments
                })
            })
        })
    },
    getDashBoard: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category, Comment]
        }).then(restaurant => {
            Comment.findAll({
                where: { RestaurantId: req.params.id },
                raw: true,
                nest: true
            }).then(comments => {
                let commentNum = comments.length
                return res.render('dashboard', {
                    restaurant: restaurant.toJSON(),
                    comments: comments,
                    commentNum
                })
            })
        })
    },
}

module.exports = restController