
// 引力、斥力常量
var NPCrepulsionIndex = 10;
var repulsionIndex = 5;
var attractionIndex = 0.05;

var limitation = 10;
var NPCLimitation = 30;

// 阻力常量ass
var resistenceIndex = 0.01;


class singleParticle {
  constructor(player, NPC, color, groupNum) {
    // 初始时为独立个体
    if (NPC || player) {
      this.leader = this;
    } else {
      this.leader = null;
    }

    if (NPC) {
      this.NPC = true;
    } else {
      this.NPC = false;
    }

    if (player) {
      this.player = true;
    } else {
      this.player = false;
    }

    // 带领团队的人数
    this.groupNum = groupNum;
    // 颜色
    this.color = color;

    if (!player) {
      // NPC玩家
      // 在没有靠近物体时使用随机游走
      // 以下为随机游走的初始值
      this.tx = random(0, 1000);
      this.ty = random(10000, 20000)
      this.x = map(noise(this.tx), 0, 1, leftX, rightX);
      this.y = map(noise(this.ty), 0, 1, upY, downY);

      //随机游走的seed 
      this.noiseStart = random(10000, 90000);

    } else {
      // 实际玩家
      // 随机初始位置
      this.x = random(leftX, rightX);
      this.y = random(upY, downY);
    }

    // 在有物体靠近时使用斥力推开
    // 以下为计算力的初始值
    this.mass = 1;
    this.location = createVector(this.x, this.y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
  }

  // 斥力
  repulsion(m) {
    var force = p5.Vector.sub(this.location, m.location);
    var distance = force.mag();

    // 限制受力范围
    if (m.NPC || m.player) {
      limitation = NPCLimitation;
      repulsionIndex = NPCrepulsionIndex;
    }

    if (distance < limitation) {
      distance = constrain(distance, 3.0, limitation);
      force.normalize();
      var strength = repulsionIndex * (this.mass * m.mass) / (distance * distance);
      // console.log("strength:");
      // console.log(strength);
      force.mult(strength);
    } else {
      force.mult(0);
    }
    return force;
  }

  leadAttract() {
    // 受leader的吸引力
    var force = p5.Vector.sub(this.location, this.leader.location);
    var distance = force.mag();

    // 限制受力范围
    distance = constrain(distance, 5.0, 10.0);
    force.normalize();
    // var strength = -attractionIndex * ( this.mass * this.leader.mass) / (distance * distance);
    var strength = -attractionIndex * ( this.mass * this.leader.mass) * distance;
    force.mult(strength);
    return force;
  }

  // 阻力
  resistence() {
    var speed = this.velocity.mag();
    var strength = 0.1 * speed * speed;
    var force = this.velocity;
    force.mult(-1);
    force.mult(strength);
    return force;
  }

  // 添加力
  applyForce(force) {
    var f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
    // console.log("acceleration:");
    // console.log(this.acceleration);
  }

  // 发力
  update() {
    this.velocity.add(this.acceleration);
    // console.log("velocity:");
    // console.log(this.velocity);
    this.location.add(this.velocity);
    // console.log("location:");
    // console.log(this.location);
    this.acceleration.mult(0);
  }

  // 染色
  tint(m) {
    // console.log("染色！")
    if (this.leader != null && m.leader == null) {
      // 我方有主，敌方无主，进行染色
      m.color = this.color;
      this.leader.groupNum = this.leader.groupNum + 1;
      m.leader = this.leader;
    } else if (this.leader == null && m.leader != null) {
      // 我方无主，敌方有主，被染色
      this.color = m.color;
      m.leader.groupNum = m.leader.groupNum + 1;
      this.leader = m.leader;
    } else if (this.leader != null && m.leader != null) {
      // 双方均有主
      if (this.leader != m.leader) {
        // 双方leader不同
        if (this.leader.groupNum > m.leader.groupNum) {
          // 我方占优势，将对方染色
          // console.log("我方占优势，将对方染色")
          m.color = this.color;
          this.leader.groupNum = this.leader.groupNum + 1;
          m.leader.groupNum = m.leader.groupNum - 1;
          m.leader = this.leader;
          if (m.NPC) {
            m.NPC = false;
          }
          if (m.player) {
            m.player = false;
          }
        } else if (this.leader.groupNum < m.leader.groupNum) {
          // 对方占优势，被染色
          this.color = m.color;
          m.leader.groupNum = m.leader.groupNum + 1;
          this.leader.groupNum = this.leader.groupNum - 1;
          this.leader = m.leader;
          if (this.NPC) {
            this.NPC = false;
          }
          if (this.player) {
            this.player = false;
          }
        }
        // 两方数量相等则不染色
      }
      // 两方leader相同，不染色
    }
    // 两方均无主，不染色
  }

  // 随机游走
  roam() {
    this.tx += 0.001;
    this.ty += 0.001;

    this.location.x = map(noise(this.tx), 0, 1, leftX, rightX);
    this.location.y = map(noise(this.ty), 0, 1, upY, downY);
  }

  // getter and setter
  get leader() {
    return this._leader;
  }
  set leader(leader) {
    this._leader = leader;
  }

  get location() {
    return this._location;
  }
  set location(location) {
    this._location = location;
  }

  get mass() {
    return this._mass;
  }
  set mass(mass) {
    this._mass = mass;
  }

  get color() {
    return this._color;
  }
  set color(color) {
    this._color = color;
  }

  get groupNum() {
    return this._groupNum;
  }
  set groupNum(groupNum) {
    this._groupNum = groupNum;
  }

  get NPC() {
    return this._NPC;
  }
  set NPC(NPC) {
    this._NPC = NPC;
  }

  get player() {
    return this._player;
  }
  set player(player) {
    this._player = player;
  }

}