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
    players: [],
    bullets: []
}

// Constants
const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000

const playerSizeX = 53
const playerSizeY = 40
const playerSpeed = 6

const bulletSizeRadius = 5
const bulletSpeed = 12
const SHOOTING_DELAY = 400 // in miliseconds

function reset () {
    const { players, bullets } = state

    players.forEach(player => {
        player.x = 50 * WORLD_HEIGHT
        player.y = 50 * WORLD_WIDTH
    })
}
reset()

function collision (player, bullet) {
    const sizeSum = (player.sizex/2 + bullet.sizeRadius/2)
    return ( (Math.abs(player.x - bullet.x) < sizeSum) &&
    (Math.abs(player.y - bullet.y) < sizeSum) )
}

function logic () {
    setTimeout(logic, 20)
    const { players, bullets } = state

    // Player Logic
    players.forEach( player => {
        const { keyboard } = player

        if (keyboard.left) {
            player.x -= playerSpeed
            player.lastDir = 'left'
        }
        if (keyboard.right) {
            player.x += playerSpeed
            player.lastDir = 'right'
        }
        if (keyboard.up) {
            player.y -= playerSpeed
            player.lastDir = 'up'
        }
        if (keyboard.down) {
            player.y += playerSpeed
            player.lastDir = 'down'
        }
        if (keyboard.shoot && (Date.now() - player.shooting >= SHOOTING_DELAY) ) {
            player.shooting = Date.now()
            const bullet = {
                playerId: player.id,
                x: player.x,
                y: player.y,
                dir: player.lastDir,
                sizeRadius: bulletSizeRadius
            }
            state.bullets.push(bullet)
        }
    })

    // Bullets state
    let i = bullets.length-1
    while (i >= 0) {
        bullet = bullets[i]

        if (bullet.dir == 'left') bullet.x -= bulletSpeed
        if (bullet.dir == 'right') bullet.x += bulletSpeed
        if (bullet.dir == 'up') bullet.y -= bulletSpeed
        if (bullet.dir == 'down') bullet.y += bulletSpeed

        let pi = 0, collide = false, bullet_owner
        while (pi < players.length && !collide) {
            bullet_owner = players.findIndex(function (player) {
                return player.id == bullet.playerId
            })
            
            if (bullet_owner != pi) {
                collide = collision(players[pi], bullet)
                if (collide) players[bullet_owner].score += 1
            }
            pi++
        }

        if (bullet.x > WORLD_WIDTH || bullet.y > WORLD_HEIGHT || collide) {
            bullets.splice(i, 1)
            --i
        }
        --i
    }

    players.forEach(player => {
        //console.log(player.score)
    })

    //let frozenState = JSON.stringify(state)
    io.sockets.emit('state', state)
}
logic()


io.on('connection', socket => {

    const player = {
        x: 0,
        y: 0,
        lastDir: 'down',
        keyboard: {},
        shooting: 0,
        sizex: playerSizeX,
        sizey: playerSizeY,
        id: socket.id,
        score: 0
    }

    state.players.push(player)
    
    socket.on('input', function (keyboard) {
        player.keyboard = keyboard
    })

    socket.on('disconnect', function () {
        state.players.splice(state.players.indexOf(player), 1)
    })
})