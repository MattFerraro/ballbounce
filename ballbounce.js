var g = 9.8;  // Acceleration due to gravity
var kWall = 10; // Walls are modelled as linear springs
var kSpring = 60; // Balls are modelled as springs
var corWall = .5;

function initializeState() {
    var state = {};

    state.room = {};
    state.room.width = 1000;
    state.room.height = 800;

    state.balls = [];

    for (var i = 0; i < 21; i++) {
        for (var j = 0; j < 21; j++) {
            var newBall = {};
            newBall.x = i * 25 + 50 - (j % 2) * 10;
            newBall.y = j * 25 + 40;
            newBall.dx = 100;
            newBall.dy = 0;
            newBall.fx = 0;
            newBall.fy = 0;
            newBall.m = 1;
            newBall.r = 10;
            state.balls.push(newBall);
        }
    }

    for (var i = 0; i < state.room.width / 25; i++) {
        var newBall = {};
        newBall.x = i * 25 + 0;
        newBall.y = state.room.height;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.width / 25; i++) {
        var newBall = {};
        newBall.x = i * 25 + 0;
        newBall.y = 0;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.height / 25; i++) {
        var newBall = {};
        newBall.x = 0;
        newBall.y = i * 25;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.height / 25; i++) {
        var newBall = {};
        newBall.x = state.room.width;
        newBall.y = i * 25;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    state.totalEnergy = 0;
    return state;
}

function update(state, dt) {
    state.totalEnergy = 0;
    state.springEnergy = 0;

    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];

        if (ball.fixed == true) {
            continue;
        }

        ball.fx = 0;
        ball.fy = 0;

        ball.fy += g * ball.m;


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
                    var alpha = Math.atan2(deltaY, deltaX);
                    var fSpringX = Math.cos(alpha) * fSpring;
                    var fSpringY = Math.sin(alpha) * fSpring;

                    ball.fx -= fSpringX;
                    ball.fy -= fSpringY;
                }
            }
        }
    }

    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];

        if (ball.fixed == true) {
            continue;
        }

        var ball = state.balls[i];

        ball.fx -= 0.02 * ball.dx;
        ball.fy -= 0.02 * ball.dy;

        var ddx = ball.fx / ball.m;
        var ddy = ball.fy / ball.m;

        ball.dx += ddx * dt;
        ball.dy += ddy * dt;

        ball.x += ball.dx * dt;
        ball.y += ball.dy * dt;

        if (ball.dy > 10000 || ball.dx > 10000) {
            ball.dy = 0;
            ball.dx = 0;
        }
        // console.log("hi");

    }

        // var deltaY = ball.dy * dt;
        // ball.yo = ball.y;
        // But if a collision is about to happen, let's do more math
        // if (ball.y + ball.r + deltaY > state.room.height) {
            // // First rewind the change to velocity
            // ball.dy += ddy * dt;

            // // h0 is the distance to the ground
            // var h0 = state.room.height - ball.y - ball.r;
            // var v0 = ball.dy;

            // var sqrtTerm = v0 * v0 + 2 * g * h0;

            // if (sqrtTerm > 0) {
            //     var sqrt = Math.sqrt(sqrtTerm);
            //     var ta = (-v0 + sqrt) / g;
            //     var tb = (-v0 - sqrt) / g;
            //     var tPreCollision = ta > 0 ? ta : tb;
            //     var tPostCollision = dt - tPreCollision;

            //     // v1 is the velocity it'll have at the end of the timestep
            //     var v1 = -(v0 + g * (tPreCollision - tPostCollision));

            //     // h1 is derived using conservation of energy!
            //     var h1 = (2 * g * h0 + v0 * v0 - v1 * v1) / (2 * g);
            //     ball.dy = v1 * corWall;

            //     ball.y = state.room.height - ball.r - h1;
            // }
            // else {
            //     ball.dy = -.06;
            //     ball.y = state.room.height - ball.r - 0.05;
            // }
        // }
        // else {
        //     ball.y += deltaY;
        // }


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

        // ball.dx += ddx * dt;
        // ball.dy -= ddy * dt;

        // ball.xo = ball.x;
        // ball.x += ball.dx * dt + .5 * ddx * dt * dt;

        // if (ball.x + ball.r > state.room.width) {
        //     ball.x = state.room.width - ball.r - 0.01;
        // }

        // state.totalEnergy += .5 * ball.m * (ball.dx * ball.dx + ball.dy * ball.dy);
        // state.totalEnergy += (state.room.height - ball.y - ball.r) * ball.m * g;
}

function drawBall(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
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
    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];
        if (ball.fixed == true) {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(255, 0, 0)');
        }
        else {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(0, 255, 0)');
        }

    }

}
