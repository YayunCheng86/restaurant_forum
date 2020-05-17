const express = require('express')
const router = express.Router()
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')
const commentController = require('../controllers/api/commentController')
const restController = require('../controllers/api/restControllers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')

// authenticated middlewares
const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
    if (req.user) {
        if (req.user.isAdmin) { return next() }
        return res.json({ status: 'error', message: 'permission denied' })
    } else {
        return res.json({ status: 'error', message: 'permission denied' })
    }
}

const userAuth = (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) {
        req.flash('error_messages', '無法編輯其他人的資料！')
        return res.redirect(`/users/${req.user.id}`)
    }
    next()
}

// 前台、home路由
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)

// 後台餐廳
router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticated, authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.get('/admin/restaurants/:id/edit', authenticated, authenticatedAdmin, adminController.editRestaurant)

// 後台user
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id', authenticated, authenticatedAdmin, adminController.putUsers)

// 後台Category
router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)

// 留言
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

// user
router.post('/signin', userController.signIn)   // JWT signin
router.post('/signup', userController.signUp)

// 註冊頁面
router.get('/signup', userController.signUpPage)

// 登入頁面
router.get('/signin', userController.signInPage)

// user、user profile
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userAuth, userController.editUser)
router.put('/users/:id', authenticated, userAuth, upload.single('image'), userController.putUser)

// favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// Like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// followship
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

module.exports = router