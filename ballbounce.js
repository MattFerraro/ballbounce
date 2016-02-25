var g = 9.8;  // Acceleration due to gravity

function initializeState() {
    var state = {};
    state.balls = [];

    for (var i = 0; i < 5; i++) {
        var newBall = {};
        newBall.x = i * 50 + 40;
        newBall.y = i * 10 + 30;
        newBall.dx = 10;
        newBall.dy = 0;
        newBall.m = 1;
        newBall.r = 20;
        state.balls.push(newBall);
    }

    state.room = {};
    state.room.width = 300;
    state.room.height = 300;

    state.totalEnergy = 0;
    return state;
}

function update(state, dt) {
    state.totalEnergy = 0;

    for (var i = state.balls.length - 1; i >= 0; i--) {
        var ball = state.balls[i];

        // Basic kinetics
        var ddy = -g;
        ball.dy -= ddy * dt;
        var deltaY = ball.dy * dt + .5 * ddy * dt * dt;

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

            // h1 is derived using conservation of energy!
            var h1 = (2 * g * h0 + v0 * v0 - v1 * v1) / (2 * g);
            ball.dy = v1;
            ball.y = state.room.height - ball.r - h1;
        }
        else {
            ball.y += deltaY;
        }

        var ddx = 0;
        ball.dx -= ddx * dt;
        ball.x += ball.dx * dt + .5 * ddx * dt * dt;

        if (ball.x - ball.r < 0) {
            var over = ball.x - ball.r
            ball.x += -2 * over;
            ball.dx *= -1;
        }
        if (ball.x + ball.r > state.room.width) {
            var over = ball.x + ball.r - state.room.width;
            ball.x -= 2 * over;
            ball.dx *= -1;
        }

        state.totalEnergy += .5 * ball.m * (ball.dx * ball.dx + ball.dy * ball.dy);
        state.totalEnergy += (state.room.height - ball.y - ball.r) * ball.m * g;
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

function draw(canvas, state) {
    var ctx = canvas.getContext("2d");
    // Clear the background
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the balls
    for (var i = state.balls.length - 1; i >= 0; i--) {
        var ball = state.balls[i];
        drawBall(ctx, ball.x, ball.y, ball.r);
    }

    // Draw the energy meter
    ctx.fillStyle = "rgb(0,0,0)"
    ctx.font = "30px Arial";
    ctx.fillText("Energy:" + Math.round(state.totalEnergy, 2) + " J" ,10,50);
}
