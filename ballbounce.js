var g = 9.8;  // Acceleration due to gravity
var kSpring = 160; // Balls are modelled as springs
var containerSize = 20;

function initializeState() {
    var state = {};

    state.room = {};
    state.room.width = 1000;
    state.room.height = 800;

    state.balls = [];

    var ids = 0;
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 26; j++) {
            var newBall = {};
            ids++;
            newBall.id = ids;
            newBall.x = i * 20 + 50 - (j % 2) * 10;
            newBall.y = j * 20 + 40;
            newBall.dx = 10;
            newBall.dy = 0;
            newBall.fx = 0;
            newBall.fy = 0;
            newBall.m = 1;
            newBall.r = 8;
            state.balls.push(newBall);
        }
    }

    for (var i = 0; i < state.room.width / 25; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = i * 25 + 0;
        newBall.y = state.room.height;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.width / 25; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = i * 25 + 0;
        newBall.y = 0;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.height / 25; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = 0;
        newBall.y = i * 25;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    for (var i = 0; i < state.room.height / 25; i++) {
        var newBall = {};
        ids++;
        newBall.id = ids;
        newBall.x = state.room.width;
        newBall.y = i * 25;
        newBall.r = 35;
        newBall.fixed = true;
        state.balls.push(newBall);
    }

    state.containerRows = [];
    for (var j = 0; j < state.room.height / containerSize; j++) {
        var containerCols = [];

        for (var i = 0; i < state.room.width / containerSize; i++) {
            var container = {};
            containerCols.push(container);
        }

        state.containerRows.push(containerCols);
    }

    for (var i = 0; i < state.balls.length; i++) {
        // Put each ball into an initial container
        var ball = state.balls[i];
        var row = Math.floor(ball.y / containerSize);
        var col = Math.floor(ball.x / containerSize);
        container[ball.id] = ball;
    }

    return state;
}

function update(state, dt) {
    var row = 0;
    var col = 0;
    var oldRow = 0;
    var oldCol = 0;

    for (var i = 0; i < state.balls.length; i++) {
        var ball = state.balls[i];

        if (ball.fixed == true) {
            continue;
        }

        ball.fx = 0;
        ball.fy = 0;

        ball.fy += g * ball.m;

        row = Math.floor(ball.y / containerSize);
        col = Math.floor(ball.x / containerSize);

        // Check for collisions against all balls in nearby cells
        var nearbyBalls = [];
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                var container = state.containerRows[row + x][col + y];
                var values = _.values(container);
                for (var k = 0; k < values.length; k++) {
                    nearbyBalls.push(values[k]);
                }
            }
        }

        // if (nearbyBalls.length > 0) {
        //     // console.log(nearbyBalls);
        // }

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

        oldRow = Math.floor(ball.y / containerSize);
        oldCol = Math.floor(ball.x / containerSize);

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

        // if (ball.dy > maxDy) {
        //     maxDy = ball.dy;
        // }
        // if (ball.dx > maxDx) {
        //     maxDx = ball.dx;
        // }

        row = Math.floor(ball.y / containerSize);
        col = Math.floor(ball.x / containerSize);

        if (row != oldRow || col != oldCol) {
            delete state.containerRows[oldRow][oldCol][ball.id];
            state.containerRows[row][col][ball.id] = ball;
        }
    }

    var specialId = 30;
    var loci = 0;
    var locj = 0;
    for (var i = 0; i < state.containerRows.length; i++) {
        var row = state.containerRows[i];

        for (var j = 0; j < row.length; j++) {
            var keys = _.keys(row[j]);
            if (keys.indexOf(specialId) != -1)
            {
                loci = i;
                locj = j;
            }
        }
    }
    console.log("loci", loci);
    console.log("locj", locj);
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
        else if (ball.id == 30) {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(0, 0, 0)');
        }
        else {
            drawBall(ctx, ball.x, ball.y, ball.r, 'rgb(0, 255, 0)');
        }

    }

}
