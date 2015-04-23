//------------------------ define the World class ----------------------
function World (config) {
  this.canvas = document.getElementById('b');
  this.context = this.canvas.getContext('2d');
  this.element = {};
  this.activeCells = {};

  this.canvas.width = config.width;
  this.canvas.height = config.height;

  this.element.size = config.cellSize;
  this.element.offset = config.offset;

  this.generationCounter = 0;
  this.liveCellsCounter = 0;
}

World.prototype.initWorld = function () {
  this.context.clearRect(this.element.offset, this.element.offset, this.canvas.width, this.canvas.height); //clear canvas
  this.activeCells = {};    //clear active cells
  this.generationCounter = 0;
  this.liveCellsCounter = 0;

  for (var i = this.element.offset; i < this.canvas.width; i+=this.element.size) {
    this.context.moveTo(i, 0);
    this.context.lineTo(i, this.canvas.height);
  }

  for (var j = this.element.offset; j < this.canvas.height; j+=this.element.size) {
    this.context.moveTo(0, j);
    this.context.lineTo(this.canvas.width, j);
  }

  this.context.strokeStyle = '#eee';
  this.context.stroke();

  this.updateMousePosition(null);
}

World.prototype.updateMousePosition = function (pos) {
  text = {};
  text.height = 15;
  text.width = 60;
  text.x = this.canvas.width - text.width;
  text.y = this.canvas.height - text.height;
  this.context.clearRect(text.x, text.y, text.width, text.height);
  if(pos === null){
    text.val = '(0, 0)';
  }else{
    text.val = '(' + pos.x + ', ' + pos.y + ')';
  }
  this.context.textBaselin = 'top';
  this.context.fillText(text.val, text.x, this.canvas.height - 3);
}

World.prototype.getRelativePisition = function (e) {
    var pos = {};
    //get the size of canvas and its potision relative to the viewport
    var rect = this.canvas.getBoundingClientRect();  
    pos.x = e.clientX - rect.left;
    pos.y = e.clientY - rect.top;

    //calculate the relative position
    pos.x -= this.element.offset;
    pos.y -= this.element.offset;
    var x = pos.x, y = pos.y;
    pos.x = Math.floor(y/this.element.size);
    pos.y = Math.floor(x/this.element.size);
    return pos;
}

World.prototype.manageActiveCell = function (cellObj, click) {
  for (var i=-1; i<=1; i++) {
    for (var j=-1; j<=1; j++) {
      if (!(i === 0 && j === 0)) {
        this.addCellHelper(JSON.stringify({x: cellObj.x+i, y: cellObj.y+j}), false);
      }
    }
  }
  var cellStr = JSON.stringify(cellObj);
  if (cellStr in this.activeCells && this.activeCells[cellStr]) {
    return;
  }
  this.addCellHelper(JSON.stringify(cellObj), true);
  this.drawCellHelper(cellObj);
  if (click) {
    this.liveCellsCounter++;
  }
}

World.prototype.addCellHelper = function (cellStr, val){
  if(val){
    this.activeCells[cellStr] = val;
  }else if(!(cellStr in this.activeCells)){
    this.activeCells[cellStr] = val;
  }
}

World.prototype.checkCellHelper = function (cellStr) {
  // console.log(cellStr);
  if((cellStr in this.activeCells) && this.activeCells[cellStr]){
    return true;
  }
  return false;
}

World.prototype.drawCellHelper = function (cellObj) {
  this.context.fillRect(cellObj.y * this.element.size, cellObj.x * this.element.size, this.element.size, this.element.size);
}

World.prototype.clearCellHelper = function (cellObj) {
  var offset = 0.1;
  this.context.clearRect(cellObj.y * this.element.size + offset, cellObj.x * this.element.size + offset, this.element.size - offset, this.element.size - offset);
}

World.prototype.hasLiveCells = function () {
  if (Object.keys(this.activeCells).length === 0) {
    return false;
  }
  for (var c in this.activeCells) {
    if (this.activeCells.hasOwnProperty(c) && this.activeCells[c]) {
      return true;
    }
  }
  return false;
}

World.prototype.nextGeneration = function () {
  this.generationCounter++;
  //for each cell in activeCells, check #of neighbours and update cell status
  var life = [];
  var dead = [];
  for (var c in this.activeCells) {
    var neighbours = 0;
    var current = JSON.parse(c);    //current cell object
    for (var i=-1; i<=1; i++){
      for (var j=-1; j<=1; j++){
        if (!(i === 0 && j === 0)) {
          var checking = JSON.stringify({x: current.x+i, y: current.y+j});
          if (this.checkCellHelper(checking)) {
            neighbours += 1;
          }
        }
      }
    }
    if (this.activeCells[c] && neighbours < 2){
      dead.push(c);
      this.liveCellsCounter--;
    }else if (this.activeCells[c] && (neighbours === 2 || neighbours === 3)){
      life.push(c);
    }else if (this.activeCells[c] && neighbours > 3){
      dead.push(c);
      this.liveCellsCounter--;
    }else if (!this.activeCells[c] && neighbours === 3){
      life.push(c);
      this.liveCellsCounter++;
    }
  }
  for (var i=0; i<life.length; i++){
    this.manageActiveCell(JSON.parse(life[i]), false);
  }
  for (var i=0; i<dead.length; i++){
    this.activeCells[dead[i]] = false;
    this.clearCellHelper(JSON.parse(dead[i]));
  }
}



//---------------------------- program starts here --------------------------------
var world, autoRun;

function draw_b () {
  var worldConfig = {
    width: 900,
    height: 700,
    cellSize: 10,
    offset: 0
  }
  world = new World(worldConfig);
  world.initWorld();

  world.canvas.addEventListener('mousemove', mouseMove, false);
  world.canvas.addEventListener('click', mouseClick, false);
}

function mouseMove (e) {
  var cell = world.getRelativePisition(e);
  world.updateMousePosition(cell);
}

function mouseClick (e) {
  var cell = world.getRelativePisition(e);
  world.manageActiveCell(cell, true);
  document.getElementById('liveCnt').innerHTML = world.liveCellsCounter;
}

function btnNext () {
  if (world.hasLiveCells()) {
    world.nextGeneration();
    updateInfo();
  }
}

function btnClear () {
  world.initWorld();
  clearInterval(autoRun);
  updateInfo();
}

function btnAutoRun () {
  autoRun = setInterval(function () {
    if (!world.hasLiveCells()) {
      clearInterval(this);
    }
    world.nextGeneration();
    updateInfo();
  }, 100);
}

function btnStop () {
  clearInterval(autoRun);
}

function updateInfo () {
  document.getElementById('generationCnt').innerHTML = world.generationCounter;
  document.getElementById('liveCnt').innerHTML = world.liveCellsCounter;
}
