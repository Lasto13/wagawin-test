var canvas;
var ctx;
var allPuzzles = [];

var imageObj;
var pieceClicked = null;
var pieceDropped = null;
var _mouse = {
    x:0,
    y:0
};

var MARGIN_CONST = 30;

// Calculate dimensions

var screen = {
    x: window.innerWidth,
    y: window.innerHeight,
}

var puzzleWidth = screen.x > 1280 ? 1280 - 100 : screen.x - 100;
var puzzleHeight = screen.y > 720 ? 720 : (3/5) * puzzleWidth;
var pieceWidth = puzzleWidth / 4;
var pieceHeight = puzzleHeight / 3;

function init(){

    setTimeout( () => {
        //alert('time is UP');
    }, 24000)

    setTimeout( () => {
        var timeleft = 21;
        var downloadTimer = setInterval(function(){
            document.getElementById("timer").innerHTML =  --timeleft;
            if(timeleft <= 0)
                clearInterval(downloadTimer);
        },1000);
    }, 2000);

    loadCanvas();
}

function loadCanvas(image){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;

    canvas.style.height = puzzleWidth; 
    canvas.style.height = puzzleHeight; 
    
    imageObj = new Image();

    imageObj.onload = function() {
    ctx.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
    clipPuzzles();
    };
    imageObj.src = 'http://lasto.promiseo.com/1.jpg';
}

function clipPuzzles(){
    var x = 0;
    var y = 0;
    for(let i = 0; i < 12 ;i++){
        
        allPuzzles.push({
            sx: x,
            sy: y
        });
        x += pieceWidth;
        if(x >= puzzleWidth){
            x = 0;
            y += pieceHeight;
        }
    }

    setTimeout( () => {
        placePieces();

    }, 3000)
    
}

function placePieces(){
    allPuzzles = generateMatrix(allPuzzles);
    ctx.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < allPuzzles.length;i++){
        piece = allPuzzles[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        ctx.drawImage(imageObj, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, yPos, pieceWidth, pieceHeight);
        xPos += pieceWidth;
        if(xPos >= puzzleWidth){
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    canvas.onmousedown = onClick;

    canvas.addEventListener("touchstart", function (e) {
        _mouse = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);
}

function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

function onClick(e){
    if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX - canvas.offsetLeft;
        _mouse.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX - canvas.offsetLeft;
        _mouse.y = e.offsetY - canvas.offsetTop;
    }
    
    pieceClicked = checkClicked();

    if(pieceClicked != null){
        ctx.clearRect(pieceClicked.xPos,pieceClicked.yPos,pieceWidth,pieceHeight);
        ctx.save();
        ctx.globalAlpha = .9;
        ctx.drawImage(imageObj, pieceClicked.sx, pieceClicked.sy, pieceWidth, pieceHeight, _mouse.x - (pieceWidth / 2), _mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        ctx.restore();
        canvas.onmousemove = render;
        canvas.onmouseup = dropped;

        canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, false);

        canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
            var mouseEvent = new MouseEvent("mouseup", {});
            canvas.dispatchEvent(mouseEvent);
        }, false);

        canvas.ontouchend = dropped;
    }
}

function checkClicked(){
        let i;
        let piece;
        for(i = 0;i < allPuzzles.length;i++){
            piece = allPuzzles[i];
            if(_mouse.x + MARGIN_CONST < piece.xPos || _mouse.x + MARGIN_CONST > (piece.xPos + pieceWidth) || _mouse.y + MARGIN_CONST < piece.yPos || _mouse.y + MARGIN_CONST > (piece.yPos + pieceHeight)){
                 
            }
            else{
                return piece;
            }
        }
        return null;
    }

function render(e){
    pieceDropped = null;
    if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX - canvas.offsetLeft;
        _mouse.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX - canvas.offsetLeft;
        _mouse.y = e.offsetY - canvas.offsetTop;
    }
    ctx.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    for(i = 0;i < allPuzzles.length;i++){
        piece = allPuzzles[i];
        if(piece == pieceClicked){
            continue;
        }
        ctx.drawImage(imageObj, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if(pieceDropped == null){
            if(_mouse.x +MARGIN_CONST < piece.xPos || _mouse.x + MARGIN_CONST > (piece.xPos + pieceWidth) || _mouse.y + MARGIN_CONST < piece.yPos || _mouse.y + MARGIN_CONST > (piece.yPos + pieceHeight)){
                
            }
            else{
                pieceDropped = piece;
                ctx.save();
                ctx.globalAlpha = .4;
                ctx.fillRect(pieceDropped.xPos,pieceDropped.yPos,pieceWidth, pieceHeight);
                ctx.restore();
            }
        }
    }
    ctx.save();
    ctx.drawImage(imageObj, pieceClicked.sx, pieceClicked.sy, pieceWidth, pieceHeight, _mouse.x - (pieceWidth / 2), _mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    ctx.restore();
}

function dropped(e){
    canvas.onmousemove = null;
    canvas.onmouseup = null;

    canvas.ontouchend = null;
    canvas.ontouchmove = null;

    if(pieceDropped != null){
        var tmp = {xPos:pieceClicked.xPos,yPos:pieceClicked.yPos};
        pieceClicked.xPos = pieceDropped.xPos;
        pieceClicked.yPos = pieceDropped.yPos;
        pieceDropped.xPos = tmp.xPos;
        pieceDropped.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}

function resetPuzzleAndCheckWin(){
    ctx.clearRect(0,0,puzzleWidth,puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0;i < allPuzzles.length;i++){
        piece = allPuzzles[i];
        ctx.drawImage(imageObj, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(gameOver,500);
    }
}

function gameOver(){
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;

    canvas.ontouchend = null;
    canvas.ontouchmove = null;
    canvas.ontouchstart = null;

    alert('game finished');
}

function generateMatrix(array){
    for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
    return array;
}