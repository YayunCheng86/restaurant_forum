const db = require('../models')
const Resaturant = db.Resaturant

const adminController = {
    getRestaurants: (req, res) => {
        Resaturant.findAll({ raw: true })
        .then(restaurants => {
            return res.render('admin/restaurants', { restaurants })
        })
        
    }
}

module.exports = adminController