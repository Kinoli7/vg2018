// Setup basic express server
var express = require ('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

const PLAYER_SIZE = 20
const PLAYER_SPEED = 5

const NUM_COINS = 10

const NUM_ENEMIES = 20
const VELOCITY_ENEMIES = 5

//let player_size_x = 30/2
//let player_size_y = 30/2

const state = {
    players: [],
    enemies: [],
    coins: []
}

function reset() {
    const { players, enemies, coins } = state
    
    // Prepare players
    players.forEach( player => {
        player.x = Math.random()*WORLD_WIDTH,
        player.y = Math.random()*WORLD_HEIGHT,
        player.score = 0
    })

    // Prepare enemies
    while (enemies.length > 0) enemies.pop()
    for (let i=0; i<NUM_ENEMIES; i++) {
        enemies = state.enemies
        enemies.push({
            x: Math.random()*WORLD_WIDTH,
            y: Math.random()*WORLD_HEIGHT,
            size: Math.random() * 20 + 10
        })
    state.enemies = enemies
    }
    
    // Prepare coins
    while (coins.length > 0) coins.pop()
    for (let i=0; i<NUM_COINS; i++) {
        coins.push({
            x: Math.random()*WORLD_WIDTH,
            y: Math.random()*WORLD_HEIGHT,
            size: 10
        })
    }
}
reset()

function collision (obj1, obj2) {
    const sizeSum = (obj1.size/2 + obj2.size/2)
    return ( (Math.abs(obj1.x - obj2.x) < sizeSum) &&
    (Math.abs(obj1.y - obj2.y) < sizeSum) )
}


function render () {
    
    const { players, enemies, coins } = state
    
    requestAnimationFrame(render)

    /*if (keyboard.a) x -= PLAYER_SPEED
    if (keyboard.d) x += PLAYER_SPEED
    if (keyboard.w) y -= PLAYER_SPEED
    if (keyboard.s) y += PLAYER_SPEED*/

    //if (isMouseDown) ctx.fillStyle = 'red'
    
    // Enemy logic
    players.forEach( player => {
        //let hasPlayerCollided = false
        enemies.forEach(enemy => {
            enemy.x += VELOCITY_ENEMIES
            enemy.y += VELOCITY_ENEMIES
            if (enemy.x < 0 || enemy.x > WORLD_WIDTH) VELOCITY_ENEMIES *= -1
            if (enemy.y < 0 || enemy.y > WORLD_HEIGHT) VELOCITY_ENEMIES *= -1
            if (collision(enemy, player)) 
        })
    })

    // Coin logic
    coins.forEach((coin, i) => {
        if (collision(player,coin)){
            player.score += Math.ceil(coin.size)
            coins.splice(i, 1)
        }
    })

    ctx.fillStyle = hasPlayerCollided ? 'blue' : 'cyan'
    ctx.fillRect(player.x-PLAYER_SIZE/2, player.y-PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE) //30/2 es la mitad del size del cuadrado
    
    ctx.fillStyle = 'black'
    ctx.font = '30px Helvetica'
    ctx.fillText(`Score: ${player.score}`, 30, 40)

}

requestAnimationFrame(render)

/*function playerDied () {

}*/

document.addEventListener('mousemove', function(event) {
    player.x = event.pageX
    player.y = event.pageY
})

document.addEventListener('mousedown', function(event) {
    isMouseDown = true;
})

document.addEventListener('mouseup', function(event) {
    isMouseDown = false;
})
