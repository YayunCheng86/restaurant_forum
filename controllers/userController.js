const userService = require('../services/userService')

const userController = {
    signUpPage: (req, res) => {
        userService.signUpPage(req, res, (data) => {
            return res.render('signup')
        })
    },
    signUp: (req, res) => {
        userService.signUp(req, res, (data) => {
            if(data['status'] === 'success'){
                req.flash('success_messages', '成功註冊帳號！')
                return res.redirect('/signin')
            } else {
                req.flash('error_messages', data['message'])
                return res.redirect('/signin')
            }
        })
    },
    signInPage: (req, res) => {
        userService.signInPage(req, res, (data) => {
            return res.render('signin')
        })
    },
    signIn: (req, res) => {
        userService.signIn(req, res, (data) => {
            req.flash('success_messages', data['message'])
            res.redirect('/restaurants')
        })
    },
    logout: (req, res) => {
        userService.logout(req, res, (data) => { 
            req.flash('success_messages', data['message'])
            res.redirect('/signin')
        })
    },
    getUser: (req, res) => {
        userService.getUser(req, res, (data) => { 
            return res.render('profile', data)
        })
    },
    editUser: (req, res) => {
        userService.editUser(req, res, (data) => {
            return res.render('editProfile', data)
        })
    },
    putUser: (req, res) => {
        userService.putUser(req, res, (data) => { 
            req.flash('success_messages', data['message'])
            return res.redirect(`/users/${req.user.id}`)
        })
    },
    addFavorite: (req, res) => {
        userService.addFavorite(req, res, (data) => {
            return res.redirect('back')
        })
    },
    removeFavorite: (req, res) => {
        userService.removeFavorite(req, res, (data) => {
            return res.redirect('back')
        })
    },
    addLike: (req, res) => {
        userService.addLike(req, res, (data) => { 
            return res.redirect('back')
        })
    },
    removeLike: (req, res) => {
        userService.removeFavorite(req, res, (data) => { 
            return res.redirect('back')
        })
    },
    getTopUser: (req, res) => {
        userService.getTopUser(req, res, (data) => { 
            return res.render('topUsers', data)
        })
    },
    addFollowing: (req, res) => {
        userService.addFollowing(req, res, (data) => { 
            return res.redirect('back')
        })
    },
    removeFollowing: (req, res) => {
        userService.removeFollowing(req, res, (data) => { 
            return res.redirect('back')
        })
    }
}

module.exports = userController