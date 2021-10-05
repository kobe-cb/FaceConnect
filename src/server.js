//Express Server
const express = require('express')
//App runs express fxn
const app = express()
//Creates server to be used with Socket.io
const server = require('http').Server(app)
//Creates a server based on Express passed to Socket.io
const io = require('socket.io')(server)
//Dyanmic Room ID using UUID
const { v4: uuidV4 } = require('uuid')


//View Engine: EJS, allows rendering of views
app.set('view engine', 'ejs')
//Uses JS/CSS files in "public" folder
app.use(express.static('public'))
//Home Page, roomID is parameter, just creates a brand new room 
//and redirect | uuidv4() allows dynamic room links
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
//Renders the Room page
app.get('/:room', (req, res) => {
    res.render('room', { roomID: req.params.room })
})

//Whenever someone connects
io.on('connection', socket => {
    //Passes roomID and userID whenever someone connects; runs join-room event
    socket.on('join-room', (roomID, userID) => {
        socket.join(roomID)
        socket.broadcast.to(roomID).emit('user-connected', userID)

        //Whenever leaves, socket.io disconnect is sent
        socket.on('disconnect', () => {
            socket.broadcast.to(roomID).emit('user-disconnected', userID)
        })
    })
})



//Starts server on port 3000 @ localhost:3000 in browser
server.listen(3000)












