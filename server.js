require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')
//Database connection

mongoose.connect("mongodb+srv://kumarvivek13025:I9Ib3b4lP3iND4bw@cluster0.vqqjiyo.mongodb.net/", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
});
const connection = mongoose.connection;

connection.on('error', (err) => {
  console.log('Connection failed...', err);
});

connection.once('open', () => {
  console.log('Database connected...');
});


//Session store
// let mongoStore = new MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })

//Evenyt Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)               //to access any event on frontend to any of the file in backend

//Session config
app.use(session({                                  //to generate cookies. Upon each request from http, server sees if the client already has a cookie, if so then it directly goes to taht id of the cookie stored in its database and if not the generates a uniques cookie fro the first time we make the request
    secret: "vivek",
    resave: false,
    store: MongoDbStore.create({                    //for the cookie, if storage not given then stores cookies by default in ram memory
        mongoUrl: "mongodb+srv://kumarvivek13025:I9Ib3b4lP3iND4bw@cluster0.vqqjiyo.mongodb.net/"
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } //24hrs
}))

//Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())                             // To use the json file anywhere in document

//Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session                    
    res.locals.user = req.user              //Here done to get the users data to the web.js page and use them to display in browser
    next()
})
//set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

//Socket
const io = require('socket.io')(server)                 //real time update on placing order and changing the status of order
io.on('connection', (socket) => {
    // Join private room
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {                     //update the status of the order in real time
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {                      //Update a new order on admin page in real time
    io.to('adminRoom').emit('orderPlaced', data)
})