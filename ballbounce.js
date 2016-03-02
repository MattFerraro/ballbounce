var g = 9.8;  // Acceleration due to gravity
var kSpring = 160; // Balls are modelled as springs
var containerSize = 20;
var numParticles = 1900;
var SPECIAL_ID = 70;
function initializeState() {
    var state = {};

    state.room = {};
    state.room.width = 1000;
    state.room.height = 800;

    state.balls = [];

    var ids = 0;

    // 100 --> 60
    // 200 --> 60
    // 300 --> 60
    // 400 --> 58
    // 500 --> 51
    // 600 --> 44
    // 700 --> 36
    // 800 --> 31
    // 900 --> 29
    // 1000 --> 25
    // 1100 --> 22
    // 1200 --> 21
    // 1300 --> 19
    // 1400 --> 17
    var particleRadius = 6;
    var wallRadius = 20;
    var sep = 13.1;
    for (var i = 0; i < numParticles; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = i * sep % (state.room.width - 90) + 50;
        newBall.y = Math.floor(i * sep / (state.room.width - 90)) * sep + 70;
        newBall.dx = 20;
        newBall.dy = 0;
        newBall.fx = 0;
        newBall.fy = 0;
        newBall.m = 1;
        newBall.r = particleRadius;
        state.balls.push(newBall);
    }

    var size = 8;
    var buffer = 15;
    // floor and ceil
    for (var i = 0; i < state.room.width / size; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = i * size + 0;
        newBall.y = state.room.height - buffer;
        newBall.r = wallRadius;
        newBall.fixed = true;
        state.balls.push(newBall);

        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = i * size + 0;
        newBall.y = buffer;
        newBall.r = wallRadius;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    // left and right walls
    for (var i = 0; i < state.room.height / size; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = buffer;
        newBall.y = i * size;
        newBall.r = wallRadius;
        newBall.fixed = true;
        state.balls.push(newBall);

        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = state.room.width - buffer;
        newBall.y = i * size;
        newBall.r = wallRadius;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    state.containerRows = [];
    for (var j = 0; j <= state.room.height / containerSize + 2; j++) {
        var containerCols = [];

        for (var i = 0; i <= state.room.width / containerSize + 2; i++) {
            var container = {};
            containerCols.push(container);
        }

        state.containerRows.push(containerCols);
    }

    for (var i = 0; i < state.balls.length; i++) {
        // Put each ball into an initial container
        var ball = state.balls[i];
        var row = Math.round(ball.y / containerSize);
        var col = Math.round(ball.x / containerSize);
        var container = state.containerRows[row][col];
        container[ball.id] = ball;
    }

    return state;
}

function update(state, dt) {
    var row = 0;
    var col = 0;
    var oldRow = 0;
    var oldCol = 0;
    var ball = null;
    var nearbyBalls = [];

    for (var i = 0; i < state.balls.length; i++) {
        ball = state.balls[i];

        if (ball.fixed == true) {
            continue;
        }

        ball.fx = 0;
        ball.fy = 0;

        ball.fy += g * ball.m;

        row = Math.round(ball.y / containerSize);
        col = Math.round(ball.x / containerSize);

        // Check for collisions against all balls in nearby cells
        nearbyBalls = [];
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (row + x >= state.containerRows.length || row + x < 0) {
                    continue;
                }
                if (col + y >= state.containerRows[0].length || col + y < 0) {
                    continue;
                }
                var container = state.containerRows[row + x][col + y];
                var values = _.values(container);
                for (var k = 0; k < values.length; k++) {
                    if (values[k].id != ball.id) {
                        nearbyBalls.push(values[k]);
                    }
                }
            }
        }
        if (ball.id == SPECIAL_ID) {
            _.each(state.balls, function(b) {
                b.nearby = false;
            })
            _.each(nearbyBalls, function(b) {
                b.nearby = true;
            })
        }

        // if (nearbyBalls.length > 0) {
        //     // console.log(nearbyBalls);
        // }

        for (var j = 0; j < nearbyBalls.length; j++) {
            // Check for collisions against all other balls
            var otherBall = nearbyBalls[j];
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

    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];

        if (ball.fixed == true) {
            continue;
        }

        oldRow = Math.round(ball.y / containerSize);
        oldCol = Math.round(ball.x / containerSize);

        ball.fx -= 0.05 * ball.dx;
        ball.fy -= 0.05 * ball.dy;

        var ddx = ball.fx / ball.m;
        var ddy = ball.fy / ball.m;

        ball.dx += ddx * dt;
        ball.dy += ddy * dt;

        ball.x += ball.dx * dt;
        ball.y += ball.dy * dt;

        // enforce an absolute speed limit
        var limit = 5;
        if (ball.dy * dt > limit) {
            ball.dy = limit / dt;
        }
        if (ball.dy * dt < -limit) {
            ball.dy = -limit / dt;
        }
        if (ball.dx * dt > limit) {
            ball.dx = limit / dt;
        }
        if (ball.dx * dt < -limit) {
            ball.dx = -limit / dt;
        }

        // if (ball.dy > maxDy) {
        //     maxDy = ball.dy;
        // }
        // if (ball.dx > maxDx) {
        //     maxDx = ball.dx;
        // }

        row = Math.round(ball.y / containerSize);
        col = Math.round(ball.x / containerSize);

        if (row >= state.containerRows.length) {
            console.log("OH NOEZ ROWS");
            console.log(ball.id);
            console.log(row, col);
            console.log("x", ball.x);
            console.log("y", ball.y);
            delete state.containerRows[oldRow][oldCol][ball.id];
        }
        else if (col >= state.containerRows[0].length) {
            console.log("OH BALLS COLS");
            console.log(row, col);
            delete state.containerRows[oldRow][oldCol][ball.id];
        }
        else if (row != oldRow || col != oldCol) {
            delete state.containerRows[oldRow][oldCol][ball.id];
            state.containerRows[row][col][ball.id] = ball;
        }
    }

    // var specialId = 30;
    // var loci = 0;
    // var locj = 0;
    // for (var i = 0; i < state.containerRows.length; i++) {
    //     var row = state.containerRows[i];

    //     for (var j = 0; j < row.length; j++) {
    //         var keys = _.keys(row[j]);
    //         if (keys.indexOf(specialId) != -1)
    //         {
    //             loci = i;
    //             locj = j;
    //         }
    //     }
    // }
    // console.log("loci", loci);
    // console.log("locj", locj);
}

function drawBall(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // ctx.beginPath();
    // ctx.arc(x, y, r - 1, 0, 2 * Math.PI, false);
    // ctx.fillStyle = color;
    // ctx.fill();
    // ctx.lineWidth = 5;
    // ctx.strokeStyle = '#003300';
    // ctx.stroke();
}

function draw(canvas, state) {
    var ctx = canvas.getContext("2d");
    // Clear the background
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the balls
    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];
        if (ball.id == SPECIAL_ID) {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(250, 250, 250)');
        }
        else if (ball.nearby == true) {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(0, 100, 0)');
        }
        else if (ball.fixed == true) {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(100, 0, 0)');
            // continue;
        }
        else {
            drawBall(ctx, ball.x, ball.y, ball.r, 'blue');
        }

    }

}
