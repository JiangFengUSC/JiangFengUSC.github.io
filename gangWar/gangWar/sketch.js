// 活动范围
leftX = -400;
rightX = 400;
upY = -400;
downY = 400;

canvasWidth = 800;
canvasHeight = 800;

// 字体
var arial;

// 动画
var asterisk;

function preload() {
  // 加载字体
  arial = loadFont('../assets/Arial.ttf');
}

function setup() {
  var cnv = createCanvas(canvasWidth, canvasHeight);;
  var x = (windowWidth - canvasWidth) / 2;
  var y = (windowHeight - canvasHeight) / 2;
  cnv.position(x, y);
  cnv.parent('sketch-holder');
  mass = new massParticles(130, 5);

}

var myLeaderX = 0;
var myLeaderY = 0;

var loss = false;
var win = false;

function draw() {
  noStroke();
  background(204);

  mass.showParticles();

//判断游戏结束
  if(!mass.playerAlive){
    loss = true;
  }

  if(mass.playerAlive && mass.leaderNum == 1){
    win = true;
  }

  if(loss){
    alert("很遗憾，你被对手群殴了");
    noLoop();
    location.reload();
  } else if (win) {
    alert("恭喜你，你消灭了所有对手！");
    noLoop();
    location.reload();
  }

}
