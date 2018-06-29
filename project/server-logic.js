// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

server.listen(port, () => {
    console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

const state = {
    players: []
}

// Constants
const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000

const speed = 3


function reset () {
    const { players } = state

    players.forEach(player => {
        player.x = 50 * WORLD_HEIGHT
        player.y = 50 * WORLD_WIDTH
    })
}

reset()

function logic () {
    setTimeout(logic, 20)
    const { players } = state

    // Player Logic
    players.forEach( player => {
        const { keyboard } = player

        if (keyboard.left) player.x -= speed
        if (keyboard.right) player.x += speed
        if (keyboard.up) player.y -= speed
        if (keyboard.down) player.y += speed
    })
    
    io.sockets.emit('state', state)
}
logic()

io.on('connection', socket => {

    const player = {
        x: 0,
        y: 0,
        lastDir: 'down',
        keyboard: {},
        id: socket.id
    }

    state.players.push(player)
    
    socket.on('input', function (keyboard) {
        player.keyboard = keyboard
    })

    socket.on('disconnect', function () {
        state.players.splice(state.players.indexOf(player), 1)
    })
})