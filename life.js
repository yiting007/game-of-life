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
  // console.log(activeCells);
  //for each cell in activeCells, check #of neighbours and update cell status
  var life = [];
  var dead = [];
  for (var c in activeCells) {
    var neighbours = 0;
    var current = JSON.parse(c);    //current cell object
    for (var i=-1; i<=1; i++){
      for (var j=-1; j<=1; j++){
        if (!(i === 0 && j === 0)) {
          var checking = JSON.stringify({x: current.x+i, y: current.y+j});
          if (checkCellHelper(checking)) {
            neighbours += 1;
          }
        }
      }
    }
    // console.log('c=' + c + ', neighbours=' + neighbours);
    if (activeCells[c] && neighbours < 2)
      dead.push(c);
    else if (activeCells[c] && (neighbours === 2 || neighbours === 3))
      life.push(c);
    else if (activeCells[c] && neighbours > 3)
      dead.push(c);
    else if (!activeCells[c] && neighbours === 3)
      life.push(c);
  }
  // console.log('dead=' + dead);
  // console.log('life=' + life);
  for (var i=0; i<life.length; i++){
    cellActiveHelper(JSON.parse(life[i]));
  }
  for (var i=0; i<dead.length; i++){
    activeCells[dead[i]] = false;
    clearCellHelper(JSON.parse(dead[i]));
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

function cellActiveHelper(cellObj) {
  for (var i=-1; i<=1; i++) {
    for (var j=-1; j<=1; j++) {
      if (!(i === 0 && j === 0)) {
        addCellHelper(JSON.stringify({x: cellObj.x+i, y: cellObj.y+j}), false);
      }
    }
  }
  addCellHelper(JSON.stringify(cellObj), true);
  drawCellHelper(cellObj);
  // console.log(activeCells);
}

/**
* @description If val === true: add or change cell state to true
*              otherwise: add cell if cell not yet exists
*/
function addCellHelper(cellStr, val){
  if(val)
    activeCells[cellStr] = val;
  else if(!(cellStr in activeCells)) 
    activeCells[cellStr] = val;
}

function checkCellHelper(cellStr) {
  // console.log(cellStr);
  if((cellStr in activeCells) && activeCells[cellStr]){
    return true;
  }
  return false;
}

function drawCellHelper(cellObj) {
  context.fillRect(cellObj.y * element.size, cellObj.x * element.size, element.size, element.size);
}

function clearCellHelper(cellObj) {
  var offset = 0.1;
  context.clearRect(cellObj.y * element.size + offset, cellObj.x * element.size + offset, element.size - offset, element.size - offset);
}
