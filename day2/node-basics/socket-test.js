// Setup basic express server
var express = require ('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

// app.get('/socket.io/socket.io.js', function () {
//     // devolver libreria socket io cliente
// })

server.listen(port, () => {
    console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

const sockets = []

io.on('connection', (socket) => {
    console.log('got a connection!', socket.id)
    
    

    socket.on('msg', function(message) {
        sockets.forEach(socket => {
            console.log(message, socket.id)
            socket.emit('msg', message)
        })
    })
})