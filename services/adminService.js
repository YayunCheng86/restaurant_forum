const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        }).then(restaurants => {
            callback({ restaurants: restaurants })
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
            callback({ restaurant: restaurant.toJSON() })
        })
    },
    createRestaurant: (req, res, callback) => {
        return Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            callback({ categories: categories })
        })
    },
    postRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        const { file } = req 
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                CategoryId: req.body.categoryId
            })
                .then((restaurant) => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
        }
    },
    putRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }

        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                    .then((restaurant) => {
                        restaurant.update({
                            name: req.body.name,
                            tel: req.body.tel,
                            address: req.body.address,
                            opening_hours: req.body.opening_hours,
                            description: req.body.description,
                            image: file ? img.data.link : restaurant.image,
                            CategoryId: req.body.categoryId
                        }).then((restaurant) => {
                            callback({ status: 'success', message: 'restaurant was successfully created' })
                        })
                    })
            })
        } else {
            return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: restaurant.image,
                        CategoryId: req.body.categoryId
                    }).then((restaurant) => {
                        callback({ status: 'success', message: 'restaurant was successfully created' })
                    })
                })
        }
    },
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
                restaurant.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: 'The restaurant is deleted.' })
                    })
            })
    },
    editRestaurant: (req, res, callback) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return Restaurant.findByPk(req.params.id)
                .then(restaurant => {
                    callback({
                        categories: categories,
                        restaurant: restaurant.toJSON()
                    })
                })
        })
    },
    getUsers: (req, res, callback) => {
        return User.findAll({ raw: true })
            .then(users => {
                callback({ users: users })
            })
    },
    putUsers: (req, res, callback) => {
        return User.findByPk(req.params.id)
            .then(user => {
                if (user.get().isAdmin === true) {
                    user.update({
                        isAdmin: 0
                    }).then(user => {
                        callback({ status: 'success', message: 'user was successfully updated' })
                    })
                } else {
                    user.update({
                        isAdmin: 1
                    }).then(user => {
                        callback({ status: 'success', message: 'user was successfully updated' })
                    })
                }
            })
    }
}    

module.exports = adminService