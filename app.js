const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')

// express-handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.listen(port, () => {
    console.log('App is listening.')
})

require('./routes')(app)