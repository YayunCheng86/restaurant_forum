const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
    getRestaurants: (req, res) => {
        return Restaurant.findAll({
            raw: true,  
            nest: true,
            include: [Category]
        })
        .then(restaurants => {
            return res.render('admin/restaurants', { restaurants })
        })
    },
    createRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return res.render('admin/create', {
                categories
            })
        })
    },
    postRestaurant: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', "The name field is required.")
            return res.redirect('back')
        }

        const { file } = req // equal to const file = req.file

        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
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
                    req.flash('success_messages', 'restaurant was successfully created')
                    return res.redirect('/admin/restaurants')
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: null,
                CategoryId: req.body.categoryId
            }).then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully created')
                return res.redirect('/admin/restaurants')
            })
        }
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
            return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
        })
    },
    editRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return Restaurant.findByPk(req.params.id).then(restaurant => {
                return res.render('admin/create', {
                    categories: categories,
                    restaurant: restaurant.toJSON()
                })
            })
        })
    },
    putRestaurant: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', "The name field is required.")
            return res.redirect('back')
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
                        })
                            .then((restaurant) => {
                                req.flash('success_messages', 'restaurant was successfully to update')
                                res.redirect('/admin/restaurants')
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
                        req.flash('success_messages', 'restaurant was successfully to update')
                        res.redirect('/admin/restaurants')
                    })
                })
        }
    },
    deleteRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
            restaurant.destroy()
            .then((restaurant) => {
                res.redirect('/admin/restaurants')
            })
        })
    },
    getUsers: (req, res) => {
        return User.findAll({ raw: true })
        .then(users => {
            // isAdmin value 改為true or false
            users.forEach(user => {
                if(user.isAdmin === 1) user.isAdmin = true
                else user.isAdmin = false
            })
            return res.render('admin/users', { users })
        })
    },
    putUsers: (req, res) => {
        return User.findByPk(req.params.id)
        .then(user => {
            if(user.get().isAdmin === true) {
                user.update({
                    isAdmin: 0
                }).then(user => {
                    req.flash('success_messages', 'user was successfully updated')
                    return res.redirect('/admin/users')
                })    
            } else {
                user.update({
                    isAdmin: 1
                }).then(user => {
                    req.flash('success_messages', 'user was successfully updated')
                    return res.redirect('/admin/users')
                })    
            }     
        })
    }
}

module.exports = adminController