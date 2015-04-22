var canvas, context, element, activeCells;

function draw_b() {
  canvas = document.getElementById('b');
  context = canvas.getContext('2d');

  canvas.width = 500;
  canvas.height = 400;

  element = {};
  element.size = 10;
  element.offset = 0;

  activeCells = {};

  for (var i = element.offset; i < canvas.width; i+=element.size) {
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
  }

  for (var j = element.offset; j < canvas.height; j+=element.size) {
    context.moveTo(0, j);
    context.lineTo(canvas.width, j);
  }

  context.strokeStyle = '#eee';
  context.stroke();

  updatePosHelper(null);

  canvas.addEventListener('mousemove', mouseMove, false);
  canvas.addEventListener('click', mouseClick, false);

  activeCells.format = function(){  //???
   for (var k in activeCells) {
     if (activeCells.hasOwnProperty(k)) {
       console.log(k + ':' + activeCells[k]);
     }
   }
  };
}

function mouseMove(e) {
  var cell = getRelativePosHelper(e);
  updatePosHelper(cell);
}

function mouseClick(e) {
  var cell = getRelativePosHelper(e);
  cellActiveHelper(cell);
}

function nextGeneration() {
  //for each cell in activeCells, check #of neighbours and update cell status
  var life = [];
  var dead = [];
  for (cell in activeCells) {
    var neighbours = 0;
    var current = {};
    for (var i=-1; i<=1; i++){
      for (var j=-1; j<=1; j++){
        if ((i === 0 && j === 0)) {
          current = {x: cell.x+i, y: cell.y+j};
          neighbours += checkCellHelper(current) ? 1 : 0;
        }
      }
    }
    console.log('neighbours=' + neighbours);
    if (activeCells[current] && neighbours < 2)
      dead.push(current);
    else if (activeCells[current] && (neighbours === 2 || neighbours === 3))
      life.push(current);
    else if (activeCells[current] && neighbours > 3)
      dead.push(current);
    else if (!activeCells[current] && neighbours === 3)
      life.push(current);
  }
  for (cell in life) {
    activeCells[cell] = true;
    drawCellHelper(cell);
  }
  for (cell in dead) {
    activeCells[cell] = false;
    clearCellHelper(cell);
  }
}

function getRelativePosHelper(e) {
    var pos = {};
    //get the size of canvas and its potision relative to the viewport
    var rect = canvas.getBoundingClientRect();  
    pos.x = e.clientX - rect.left;
    pos.y = e.clientY - rect.top;

    //calculate the relative position
    pos.x -= element.offset;
    pos.y -= element.offset;
    var x = pos.x, y = pos.y;
    pos.x = Math.floor(y/element.size);
    pos.y = Math.floor(x/element.size);
    return pos;
}

function updatePosHelper(pos) {
  text = {};
  text.height = 15;
  text.width = 60;
  text.x = canvas.width - text.width;
  text.y = canvas.height - text.height;
  context.clearRect(text.x, text.y, text.width, text.height);
  if(pos === null){
    text.val = '(0, 0)';
  }else{
    text.val = '(' + pos.x + ', ' + pos.y + ')';
  }
  context.textBaselin = 'top';
  context.fillText(text.val, text.x, canvas.height - 3);
}

function cellActiveHelper(cell) {
  for (var i=-1; i<=1; i++) {
    for (var j=-1; j<=1; j++) {
      if (!(i === 0 && j === 0)) {
        // console.log('add cell: (' + (cell.x+i) + ', ' + (cell.y+j) + ')');
        addCellHelper({x: cell.x+i, y: cell.y+j}, false);
      }
    }
  }
  addCellHelper(cell, true);
  drawCellHelper(cell);
}

function addCellHelper(cell, val){
  if(cell.x < 0 || cell.y < 0)  //check lower bound
    return;
  activeCells[cell] = val;
}

function checkCellHelper(cell) {
  if(cell.x < 0 || cell.y < 0)
    return false;
  if(!(cell in activeCells))
    return false;
  if(!activeCells[cell])
    return false;
  return true;
}

function drawCellHelper(cell) {
  context.fillRect(cell.y * element.size, cell.x * element.size, element.size, element.size);
}

function clearCellHelper(cell) {
  context.clearRect(cell.y * element.size, cell.x * element.size, element.size, element.size);
}
