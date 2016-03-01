var g = 9.8;  // Acceleration due to gravity
var kWall = 10; // Walls are modelled as linear springs
var kSpring = 60; // Balls are modelled as springs
var corWall = .98;

function initializeState() {
    var state = {};
    state.balls = [];

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 7; j++) {
            var newBall = {};
            newBall.x = i * 50 + 140;
            newBall.y = j * 50 + 230;
            newBall.dx = 10;
            newBall.dy = 0;
            newBall.m = 1;
            newBall.r = 20;
            state.balls.push(newBall);
        }
    }
    // var topBall = {};
    // topBall.x = 170;
    // topBall.xo = topBall.x;
    // topBall.y = 80;
    // topBall.yo = topBall.y;
    // topBall.dx = 0;
    // topBall.dy = 0;
    // topBall.m = 1;
    // topBall.r = 20;
    // state.balls.push(topBall);

    // var bottomLeftBall = {};
    // bottomLeftBall.x = 150 - 25;
    // bottomLeftBall.y = 130;
    // bottomLeftBall.dx = 0;
    // bottomLeftBall.dy = 0;
    // bottomLeftBall.m = 1;
    // bottomLeftBall.r = 20;
    // state.balls.push(bottomLeftBall);

    // var bottomRightBall = {};
    // bottomRightBall.x = 150;
    // bottomRightBall.xo = bottomRightBall.x;
    // bottomRightBall.y = 130;
    // bottomRightBall.yo = bottomRightBall.y;
    // bottomRightBall.dx = 0;
    // bottomRightBall.dy = 0;
    // bottomRightBall.m = 1;
    // bottomRightBall.r = 20;
    // state.balls.push(bottomRightBall);


    state.room = {};
    state.room.width = 600;
    state.room.height = 600;

    wallThickness = 10;
    state.verticalWalls = [
        {x: 0, y: 0, w: wallThickness, h: state.room.height},
        {x: state.room.width - wallThickness, y: 0, w: wallThickness, h: state.room.height}
    ];

    state.horizontalWalls = [
        {x: 0, y: 0, w: state.room.width, h: wallThickness},
        {x: 0, y: state.room.height - wallThickness, w: state.room.width, h: wallThickness},
    ];

    state.totalEnergy = 0;
    return state;
}

function update(state, dt) {
    state.totalEnergy = 0;
    state.springEnergy = 0;

    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];

        var ddy = -g;
        var ddx = 0;

        var dxDamp = 1;
        var dyDamp = 1;

        for (var j = 0; j < state.balls.length; j++) {
            // Check for collisions against all other balls
            if (j != i) {
                var otherBall = state.balls[j];
                var deltaX = otherBall.x - ball.x;
                var deltaY = otherBall.y - ball.y;
                var distSquared = deltaX * deltaX + deltaY * deltaY;
                var minDist = ball.r + otherBall.r;
                var minDistSquared = minDist * minDist;

                if (distSquared < minDistSquared) {
                    // Cool, a ball-on-ball collision is happening
                    var compressionDist = minDist - Math.sqrt(distSquared);
                    var fSpring = compressionDist * kSpring;
                    state.springEnergy += .5 * kSpring * compressionDist * compressionDist;
                    var alpha = Math.atan2(deltaY, deltaX);
                    var fSpringX = Math.cos(alpha) * fSpring;
                    var fSpringY = Math.sin(alpha) * fSpring;

                    dxDamp *= .98;
                    dyDamp *= .98;

                    ddx -= fSpringX / ball.m;
                    ddy += fSpringY / ball.m;
                }
            }
        }

        ball.dx += ddx * dt;
        ball.dy -= ddy * dt;

        ball.dx *= dxDamp;
        ball.dy *= dxDamp;

        var deltaY = ball.dy * dt + .5 * ddy * dt * dt;
        ball.yo = ball.y;
        // But if a collision is about to happen, let's do more math
        if (ball.y + ball.r + deltaY > state.room.height) {
            // First rewind the change to velocity
            ball.dy += ddy * dt;

            // h0 is the distance to the ground
            var h0 = state.room.height - ball.y - ball.r;
            var v0 = ball.dy;
            var sqrt = Math.sqrt(v0 * v0 + 2 * g * h0);
            var ta = (-v0 + sqrt) / g;
            var tb = (-v0 - sqrt) / g;
            var tPreCollision = ta > 0 ? ta : tb;
            var tPostCollision = dt - tPreCollision;

            // v1 is the velocity it'll have at the end of the timestep
            var v1 = -(v0 + g * (tPreCollision - tPostCollision));

            // Multiply by a loss
            v1 *= corWall;

            // h1 is derived using conservation of energy!
            var h1 = (2 * g * h0 + v0 * v0 - v1 * v1) / (2 * g);
            ball.dy = v1;

            ball.y = state.room.height - ball.r - h1;
        }
        else {
            ball.y += deltaY;
        }

        // Let's handle horizontal collisions against vertical walls
        // by modelling them as forces
        // for (var j = 0; j < state.verticalWalls.length; j++) {
        //     var wall = state.verticalWalls[j];
        //     // Check to see if we're inside the wall
        //     var rightEdge = ball.x + ball.r;
        //     var futureRightEdge = rightEdge + ball.dx * dt + .5 * ddx * dt * dt;
        //     if (futureRightEdge > wall.x && futureRightEdge < wall.x + wall.w) {
                // Cool, the right edge of the ball will be, at the end of this
                // time step, bouncing against the left edge of this vertical wall
                // var tCollision =
                // var overshyoot = rightEdge - wall.x;
                // var forceLeft = overshoot * kWall;
                // ddx += forceLeft;

                // How much energy was gained by transporting into
                // the wall?
                // var energyGain = .5 * kWall * overshoot * overshoot;
                // var Ukx = .5 * ball.m * (ball.dx * ball.dx);
                // ball.dx = Math.sqrt(2 * Ukx / ball.m);
        //     }
        // }

        ball.xo = ball.x;
        ball.x += ball.dx * dt + .5 * ddx * dt * dt;

        if (ball.x - ball.r < 0) {
            var over = ball.x - ball.r
            ball.x += -2 * over;
            ball.dx *= -corWall;
        }
        if (ball.x + ball.r > state.room.width) {
            var over = ball.x + ball.r - state.room.width;
            ball.x -= 2 * over;
            ball.dx *= -corWall;
        }

        state.totalEnergy += .5 * ball.m * (ball.dx * ball.dx + ball.dy * ball.dy);
        state.totalEnergy += (state.room.height - ball.y - ball.r) * ball.m * g;
    }
    state.totalEnergy += .5 * state.springEnergy;
    if (state.springEnergy > 0) {
        // console.log(.5 * state.springEnergy);
    }
}

function drawBall(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
}

function drawWall(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function draw(canvas, state) {
    var ctx = canvas.getContext("2d");
    // Clear the background
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the balls
    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];
        drawBall(ctx, ball.x, ball.y, ball.r);
    }

    // Draw the horizontal walls
    for (var i = 0; i < state.horizontalWalls.length; i++) {
        var wall = state.horizontalWalls[i];
        drawWall(ctx, wall.x, wall.y, wall.w, wall.h, 'rgba(0, 200, 0, .5)');
    }
    // Draw the vertical walls
    for (var i = 0; i < state.verticalWalls.length; i++) {
        var wall = state.verticalWalls[i];
        drawWall(ctx, wall.x, wall.y, wall.w, wall.h, 'rgba(200, 0, 0, .5)');
    }

    // Draw the energy meter
    ctx.fillStyle = "rgb(0,0,0)"
    ctx.font = "30px Arial";
    ctx.fillText("Energy:" + Math.round(state.totalEnergy, 2) + " J" ,10,50);
}
