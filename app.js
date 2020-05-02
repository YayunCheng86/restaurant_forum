const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const db = require('./models')
const bodyParser = require('body-parser') 
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./config/passport')

// express-handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// body-parser
app.use(bodyParser.urlencoded({ extended: true }))

// session
app.use(session({ secret: 'covid-19', resave: false, saveUninitialized: false }))

// passport
app.use(passport.initialize())
app.use(passport.session())

// flash
app.use(flash())

// local variables
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    res.locals.user = req.user
    res.locals.isAuthenticated = req.isAuthenticated()
    next()
})

app.listen(port, () => {
    db.sequelize.sync()
    console.log('App is listening.')
})

require('./routes')(app, passport)