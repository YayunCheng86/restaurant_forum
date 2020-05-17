const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const restController = require('../controllers/restControllers')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// middleware
const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.isAdmin) { return next() }
        return res.redirect('/')
    }
    res.redirect('/signin')
}

const userAuth = (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) {
        req.flash('error_messages', '無法編輯其他人的資料！')
        return res.redirect(`/users/${req.user.id}`)
    }
    next()
}

// 前台、home路由
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)

//後台餐廳
router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

// 後台user
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)

// 後台分類
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

// user、user profile
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userAuth, userController.editUser)
router.put('/users/:id', authenticated, userAuth, upload.single('image'), userController.putUser)

// 留言
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

// favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// Like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// followship
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// 註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

// 登入登出
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

module.exports = router
