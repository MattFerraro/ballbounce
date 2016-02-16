var g = 9.8;  // Acceleration due to gravity

function initializeState() {
    var state = {};
    state.balls = [];

    for (var i = 0; i < 5; i++) {
        var newBall = {};
        newBall.x = i * 50 + 40;
        newBall.y = i * 10 + 30;
        newBall.dx = 0;
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
        // F = mg for gravity pulling down a point mass. We equate that force
        // with ma to find acceleration and get:
        // F = mg = ma --> g = a
        var ddx = 0;
        var ddy = -g;
        // ^ when we're handling collisions, there will be more terms
        ball.dy -= ddy * dt;
        ball.y += ball.dy * dt;

        ball.dx -= ddx * dt;
        ball.x += ball.dx * dt;

        // Collision detection against the ground
        if (ball.y + ball.r > state.room.height) {
            // Mirror the ball off the ground
            var over = ball.y + ball.r - state.room.height;
            ball.y = state.room.height - over - ball.r;
            ball.dy *= -1;
        }

        state.totalEnergy += .5 * ball.m * (ball.dx * ball.dx + ball.dy * ball.dy);
        state.totalEnergy += (state.room.height - ball.y) * ball.m * g;
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
