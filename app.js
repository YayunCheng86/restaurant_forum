const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const exphbs = require('express-handlebars')
const db = require('./models')
const bodyParser = require('body-parser') 
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./config/passport')
const methodOverride = require('method-override')
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// express-handlebars
app.engine('handlebars', exphbs({ 
    defaultLayout: 'main',
    helpers: require('./config/handlebars-helper')
}))
app.set('view engine', 'handlebars')

//static file 
app.use('/upload', express.static(__dirname + '/upload'))

// body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// method-override
app.use(methodOverride('_method'))

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

require('./routes')(app)