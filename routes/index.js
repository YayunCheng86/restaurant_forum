const restController = require('../controllers/restControllers')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
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
    app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
    app.get('/restaurants', authenticated, restController.getRestaurants)
    app.get('/restaurants/feeds', authenticated, restController.getFeeds)
    app.get('/restaurants/:id', authenticated, restController.getRestaurant)
    app.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)

    //後台路由 
    app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
    app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
    app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
    app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
    app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
    app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
    app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
    app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
    app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
    app.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)
    app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
    app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
    app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
    app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
    app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

    // user profile
    app.get('/users/top', authenticated, userController.getTopUser)
    app.get('/users/:id', authenticated, userController.getUser)
    app.get('/users/:id/edit', authenticated, userAuth, userController.editUser)
    app.put('/users/:id', authenticated, userAuth, upload.single('image'), userController.putUser)
    
    // 留言
    app.post('/comments', authenticated, commentController.postComment)
    app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
    
    // favorite
    app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
    app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

    // Like
    app.post('/like/:restaurantId', authenticated, userController.addLike)
    app.delete('/like/:restaurantId', authenticated, userController.removeLike)

    // followship
    app.post('/following/:userId', authenticated, userController.addFollowing)
    app.delete('/following/:userId', authenticated, userController.removeFollowing)

    // 註冊
    app.get('/signup', userController.signUpPage)
    app.post('/signup', userController.signUp)

    // 登入登出
    app.get('/signin', userController.signInPage)
    app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
    app.get('/logout', userController.logout)
}
