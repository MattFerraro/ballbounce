
function drawBall(ctx, x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
}

function draw(canvas) {
    var ctx = canvas.getContext("2d");
    // Clear the background
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ball = {};
    ball.x = 100;
    ball.y = 100;
    ball.r = 20;

    drawBall(ctx, ball.x, ball.y, ball.r);
}
