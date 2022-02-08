var tintDist = 10;

class massParticles {
  constructor(num, NPCLeadernum) {
    this.particleArray = new Array(num+NPCLeadernum+1);
    for (var i = 0; i < num; i++) {
      this.particleArray[i] = new singleParticle(false, false, color(0,0,0), 0);
    }

    // NPC leader
    this.particleArray[num] = new singleParticle(false, true, color(200,0,0), 1);
    this.particleArray[num+1] = new singleParticle(false, true, color(0,200,0), 1);
    this.particleArray[num+2] = new singleParticle(false, true, color(0,0,200), 1);
    this.particleArray[num+3] = new singleParticle(false, true, color(0,200,200), 1);
    this.particleArray[num+4] = new singleParticle(false, true, color(200,0,200), 1);
    this.particleArray[num+5] = new singleParticle(false, true, color(255, 255, 255), 1);

    // 真实玩家
    this.particleArray[num+6] = new singleParticle(true, false, color(250,250,0), 1)

    // leader数量，用来判断输赢
    this.leaderNum = NPCLeadernum + 1;
    // player 是否生存
    this.playerAlive = true;
  }

  // 相互排斥 以及 染色
  addForceAndTint() {
    for (var i = 0; i < this.particleArray.length; i++) {
      for (var j = 0; j < this.particleArray.length; j++) {
        if (i != j) { //不要排斥自身！
          // 施加斥力
          var repulsion = this.particleArray[i].repulsion(this.particleArray[j]);

          // 如果在斥力不为0，则添加斥力
          if (repulsion.x != 0 && repulsion.y != 0) {
            this.particleArray[i].applyForce(repulsion);
            
            // 两点距离
            var pDist = p5.Vector.sub(this.particleArray[i].location, this.particleArray[j].location);
            pDist = pDist.mag();

            // 染色
            if(pDist < tintDist){
              this.particleArray[i].tint(this.particleArray[j]);
            }
          }
        }
      }
      //添加leader的吸引力
      if(this.particleArray[i].leader != null){
        var attraction = this.particleArray[i].leadAttract(this.particleArray[i].leader);
        this.particleArray[i].applyForce(attraction)
      }

      this.particleArray[i].applyForce(this.particleArray[i].resistence());
      
    }
  }


  // 画出粒子
  showParticles() {
    // 加入斥力 和 染色
    this.addForceAndTint();

    if (!this.particleArray[this.particleArray.length-1].player) {
      this.playerAlive = false;
    }

    var numOfLeader = 0;

    for (var i = 0; i < this.particleArray.length; i++) {
      if (this.particleArray[i].NPC) {
        numOfLeader++;
      }
      // 检查leader是否存活
      if(this.particleArray[i].leader != null){
        // leader死亡则变更leader
        if(!this.particleArray[i].leader.NPC){
          this.particleArray[i].leader = this.particleArray[i].leader.leader;
          this.particleArray[i].color = this.particleArray[i].leader.color;
        }
      }

      fill(this.particleArray[i].color);

      var x = this.particleArray[i].location.x;
      var y = this.particleArray[i].location.y;

      if(this.particleArray[i].NPC){
        // 显示NPC的框
        stroke(255, 204, 0);
        strokeWeight(1);
        ellipse(x, y, 4, 4);

        if(this.particleArray[i].leader != null){
          // 显示目前团队人数
          fill(0);
          textFont(arial,5);
          text(this.particleArray[i].leader.groupNum, x-1.5, y-3);
        }

      }else if(this.particleArray[i].player){
        // 显示player的框
        stroke(255, 204, 0);
        strokeWeight(1);
        ellipse(x, y, 4, 4);

        // 显示目前团队人数
        fill(0);
        textFont(arial,5);
        text(this.particleArray[i].leader.groupNum, x-1.5, y-3);

      } else {
        noStroke();
        ellipse(x, y, 3, 3);
      }

      
      
      // 玩家坐标由键盘控制
      if (this.particleArray[i].player) {
        // 相机跟随
        camera.position.x = this.particleArray[i].location.x;
        camera.position.y = this.particleArray[i].location.y;

        if(mouseIsPressed)
          camera.zoom = 2;
        else
          camera.zoom = 5;

        if (keyIsDown(87)) {
          // key W
          this.particleArray[i].location.y -= 1;
        } else if (keyIsDown(83)) {
          // key S
          this.particleArray[i].location.y += 1;
        } else if (keyIsDown(65)) {
          // key A
          this.particleArray[i].location.x -= 1;
        } else if (keyIsDown(68)) {
          // key D
          this.particleArray[i].location.x += 1;
        }

      } else{
        if (this.particleArray[i].leader == null || this.particleArray[i].NPC) {
          // 随机游走
          this.particleArray[i].roam();
        }
      }
      
      // 牛顿力学
      this.particleArray[i].update();
      
    }

    this.leaderNum = numOfLeader + 1;
  }

  get leaderNum() {
    return this._leaderNum;
  }
  set leaderNum(leaderNum) {
    this._leaderNum = leaderNum;
  }

  get playerAlive() {
    return this._playerAlive;
  }
  set playerAlive(playerAlive) {
    this._playerAlive = playerAlive;
  }
}