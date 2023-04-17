// set our game screen variables
const GAME_WIDTH = 1334;
const GAME_HEIGHT = 750;
const GAME_MARGIN = GAME_WIDTH * 0.05;
const GAME_BG_COLOR = '#333f58';
const GAME_TEXT_COLOR = '#FBBCAD';
const GAME_PLAYER_ONE_COLOR = '#ABD1BB';

const GAME_CONFIGS = {
  GAME_WIDTH,
  GAME_HEIGHT,  
  GAME_MARGIN,
  GAME_BG_COLOR,
  GAME_TEXT_COLOR,
  GAME_PLAYER_ONE_COLOR
}

// initialize game object and stats
const GAMESTATE = {
    MENU: 0,
    RUNNING: 1,
    PAUSED: 2,
    GAMEOVER: 3
};

const GOAL_INDEX = {
  MOVE: 0,
  HIT: 1,
};

const ARROW_DIMENSION = {
  WIDTH: 113,
  HEIGHT: 19,
};

const initPosition = {
  x: GAME_WIDTH * 0.02,
  y: 750 / 2 - 96,
};


// configs
const eventInfo = {
  gameTime: 20 * 1000,
  arrowSpeed: 500,
  shootingInterval: 100,
  targetSpeed: 90,
  obstacleSpeed: 50,
  cupidSpeed: 100,
  playTimes: 5,
};


const prefix = 'https://dl.dir.freefiremobile.com/common/web_event/'
const detectCollision = (el, target) => {
  if (
    el.position.x < target.position.x + target.width &&
    el.position.x + el.width > target.position.x &&
    el.position.y < target.position.y + target.height &&
    el.position.y + el.height > target.position.y
  ) {
    return true;
  }
  return false;
};
const generateUUID = () => {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c,
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};
const Background = {
  width: 1334,
  height: 750,
  status: 'static',
  ctx: undefined,
  init(ctx) {
    this.ctx = ctx;
    this.imgObj = new Image();
    this.imgObj.src = `${prefix}/cupidTrial/images/bg.png`;
    this.imgObj.onload = () => {
      this.ctx.drawImage(this.imgObj, this.width, 0, this.width, this.height);
      this.loading = false;
    }
  },
  draw() {
    if (this.loading) return;
    if (typeof this[this.status] === 'function') this[this.status]();
  },
  static() {
    this.ctx.drawImage(this.imgObj, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
  }
};
const Goal = {
  onHit: 0,
  loading: true,
  width: 123,
  height: 132,
  status: "moving",
  direction: "up",
  sprites: [],
  spritesIndex: GOAL_INDEX.MOVE,
  position: {
    x: 900,
    y: 750 / 2 - 61,
  },
  speed: 80,
  ctx: null,
  init(ctx, game, configs) {
    const { targetSpeed } = configs;
    this.speed = targetSpeed;
    this.ctx = ctx;
    const imageList = [
      `${prefix}/cupidTrial/images/target.png`,
      `${prefix}/cupidTrial/images/target_active.png`,
    ];
    imageList.forEach((img) => {
      const imgObj = new Image();
      imgObj.src = img;
      imgObj.onload = () => {
        this.loading = false;
      };
      this.sprites.push(imgObj);
    });
    this.game = game;
  },
  setStatus(status) {
    this.status = status;
  },
  draw(params) {
    if (this.loading) {
      return;
    }
    if (typeof this[this.status] === "function") {
      this[this.status](params);
    }
  },
  moveAction(elapsed) {
    this.deltaTime = elapsed;
    const movingOffset = Number(
      (this.speed / this.deltaTime).toFixed(2)
    );

    if (this.direction === "down") {
      this.position.y += movingOffset;
      if (this.position.y + this.height > GAME_HEIGHT - GAME_MARGIN)
        this.direction = "up";
    } else {
      this.position.y -= movingOffset;
      // 100 is end position of countdown timer.
      if (this.position.y < 100) this.direction = "down";
    }
  },
  render(image) {
    this.ctx.drawImage(
      image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  },
  moving(elapsed) {
    this.moveAction(elapsed);
    this.render(this.sprites[this.spritesIndex]);
  },
  hit(elapsed) {

    this.onHit += 1;
    this.moveAction(elapsed);
    this.spritesIndex = GOAL_INDEX.HIT;
    this.render(this.sprites[this.spritesIndex]);
    
  },
  resetGoal() {
    this.spritesIndex = GOAL_INDEX.MOVE;
  },
};
const Obstacle = {
  loading: true,
  width: 140,
  height: 110,
  status: "moving",
  direction: "down",
  deltaTime: 1,
  position: {
    x: GAME_WIDTH / 2 - 151,
    y: 750 / 2 - 110,
  },
  speed: 150,
  ctx: null,
  init(ctx, game, configs) {
    const { obstacleSpeed } = configs;
    this.speed = obstacleSpeed;
    this.ctx = ctx;
    this.imgObj = new Image();
    this.imgObj.src = `${prefix}/cupidTrial/images/stone.png`;
    this.imgObj.onload = () => {
      this.ctx.drawImage(
        this.imgObj,
        this.width,
        0,
        this.width,
        this.height
      );
      this.loading = false;
    };
    this.game = game;
  },
  moveAction(elapsed) {
    this.deltaTime = elapsed;
    const movingOffset = Number(
      (this.speed / this.deltaTime).toFixed(2)
    );
    if (this.direction === "down") {
      this.position.y += movingOffset;
      if (this.position.y + this.height > GAME_HEIGHT - GAME_MARGIN)
        this.direction = "up";
    } else {
      this.position.y -= movingOffset;
      if (this.position.y < 100) this.direction = "down";
    }
  },
  moving(elapsed) {
    this.moveAction(elapsed);
    this.ctx.drawImage(
      this.imgObj,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  },
  draw(params) {
    if (this.loading) {
      return;
    }
    if (typeof this[this.status] === "function") {
      this[this.status](params);
    }
  },
};
const Outer = {
  ctx: undefined,
  running: true,
  buttonInfo: {
    width: 144,
    height: 144,
    posX: 1076,
    posY: 560,
    press: false,
  },
  init(ctx, game) {
    this.ctx = ctx;
    this.initButton();
    this.game = game;
  },
  initButton() {
    this.buttonObj = new Image();
    this.buttonObj.src = `${prefix}/cupidTrial/images/btn_fire.png`;
    this.buttonObj.onload = () => {
      this.loading = false;
    };
  },
  drawBtn() {
    this.ctx.drawImage(
      this.buttonObj,
      this.buttonInfo.posX,
      this.buttonInfo.posY,
      this.buttonInfo.width,
      this.buttonInfo.height
    );
    if (this.buttonInfo.press) {
      this.ctx.drawImage(
        this.buttonObj,
        this.buttonInfo.posX,
        this.buttonInfo.posY,
        this.buttonInfo.width,
        this.buttonInfo.height
      );
    }
  },
  checkInBtn(x, y) {
    if (
      x >= this.buttonInfo.posX &&
      x <= this.buttonInfo.posX + this.buttonInfo.width &&
      y >= this.buttonInfo.posY &&
      y <= this.buttonInfo.posY + this.buttonInfo.height
    ) {
      return true;
    }
    return false;
  },
  draw() {
    this.drawBtn();
  },
  stop() {
    this.running = false;
  },
  restart() {
    this.running = true;
  },
};
const Player = {
  arrows: [],
  deltaTime: 0,
  loading: true,
  width: 202,
  height: 192,
  shootSprites: [],
  position: { ...initPosition },
  speed: 40,
  arrowSpeed: 300,
  direction: "down",
  status: "moving",
  ctx: undefined,
  shootConfigs: {
    index: 0,
  },
  init(ctx, game, configs) {
    const { cupidSpeed } = configs;
    this.speed = cupidSpeed;
    this.ctx = ctx;
    this.imgObj = new Image();
    this.imgObj.src = `${prefix}/cupidTrial/images/cupid_sprite1.png`;
    this.imgObj.onload = () => {
      this.ctx.drawImage(
        this.imgObj,
        this.width,
        0,
        this.width,
        this.height
      );
      this.loading = false;
    };
    this.initShoot();
    this.game = game;
    this.status = "moving";
  },
  draw(params) {
    if (this.loading) {
      return;
    }
    if (typeof this[this.status] === "function") {
      this[this.status](params);
    }
  },
  initShoot() {
    const imgList = [
      `${prefix}/cupidTrial/images/cupid_sprite1.png`,
      `${prefix}/cupidTrial/images/cupid_sprite2.png`,
      `${prefix}/cupidTrial/images/cupid_sprite3.png`,
      `${prefix}/cupidTrial/images/cupid_sprite4.png`,
      `${prefix}/cupidTrial/images/cupid_sprite5.png`,
    ];
    imgList.forEach((img) => {
      const imgObj = new Image();
      imgObj.src = img;
      imgObj.onload = () => {
        this.loading = false;
      };
      this.shootSprites.push(imgObj);
    });
  },
  setStatus(status) {
    this.status = status;
  },
  moveAction(elapsed) {
    this.deltaTime = elapsed;
    const movingOffset = Number(
      (this.speed / this.deltaTime).toFixed(2)
    );

    if (this.direction === "down") {
      this.position.y += movingOffset;
      if (this.position.y + this.height > GAME_HEIGHT - GAME_MARGIN)
        this.direction = "up";
    } else {
      this.position.y -= movingOffset;
      if (this.position.y < 100) this.direction = "down";
    }
  },
  moving(elapsed) {
    this.moveAction(elapsed);
    this.ctx.drawImage(
      this.imgObj,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  },

  getShootImg() {
    return this.shootSprites[parseInt(this.shootConfigs.index)];
  },
  setShoot(arrowSpeed) {
    if (this.status !== "moving") {
      return;
    }
    this.arrowSpeed = arrowSpeed;
    this.setStatus("shoot");
  },
  shoot() {
    const img = this.getShootImg();
    const arrow = new Projectile(
      this.ctx,
      {
        x: this.position.x + ARROW_DIMENSION.WIDTH,
        y: this.position.y + this.height / 2,
      },
      this.arrowSpeed
    );

    this.moveAction(this.deltaTime);
    this.ctx.drawImage(
      img,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    this.shootConfigs.index += 0.3;
    if (this.shootConfigs.index > this.shootSprites.length - 1) {
      this.shootConfigs.index = this.shootSprites.length - 1;
    }

    if (this.shootConfigs.index >= 4) {
      this.game.transport("shoot");
      this.shootConfigs.index = 0;
      this.setStatus("moving");

      this.arrows.push(arrow);
    }
  },
  restart() {
    this.arrows = [];
    this.position = { ...initPosition };
    this.setStatus("moving");
  },
};
const Scene = {
  ctx: null,
  arrowDimension: {
    width: 113,
    height: 19,
  },
  arrowImg: null,
  initArrow(ctx) {
    this.ctx = ctx;
    this.arrowImg = new Image();
    this.arrowImg.src =
      `${prefix}/cupidTrial/images/arrow.png`;

    this.arrowImg.onload = () => {
      this.ctx.drawImage(
        this.arrowImg,
        this.arrowDimension.width,
        0,
        this.arrowDimension.width,
        this.arrowDimension.height
      );
      this.loading = false;
    };
  },
};
class Projectile {
  constructor(ctx, position, xSpeed) {
    this.ctx = ctx;
    this.position = position;
    this.width = Scene.arrowDimension.width;
    this.height = Scene.arrowDimension.height;
    this.onHit = false;
    this.id = generateUUID();
    this.speed = {
      x: xSpeed,
      y: 40,
    };
  }
  draw() {
    this.ctx.drawImage(
      Scene.arrowImg,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  eject(deltaTime) {
    this.draw();

    this.position.x += this.speed.x / deltaTime;

    // slight downward drag to imitate gravity
    if (this.position.x > GAME_CONFIGS.WIDTH / 2) {
      this.position.y += this.speed.y / deltaTime;
    }
  }
  hanging(position) {
    this.position = { ...position };
    this.draw();
  }
};
const Score = {
  score: 0,
  posX: 1100,
  poxY: 40,
  status: "static",
  coinWidth: 46,
  coinHeight: 44,
  ctx: undefined,
  init(ctx, game) {
    this.ctx = ctx;
    this.imgObj = new Image();
    this.imgObj.src = `${prefix}/cupidTrial/images/gold_coin.png`;
    this.imgObj.onload = () => {
      this.loading = false;
    };
    this.game = game;
  },
  restart() {
    this.score = 0;
  },
  draw() {
    if (typeof this[this.status] === "function") {
      this[this.status]();
    }
  },
  drawCoin() {
    this.ctx.drawImage(
      this.imgObj,
      this.posX,
      this.poxY,
      this.coinWidth,
      this.coinHeight
    );
  },
  static() {
    this.drawCoin();
    this.drawScore();
  },
  addScore(num) {
    this.score += num;
  },
  drawScore() {
    this.ctx.font = "30px Staatliches";
    this.ctx.fillStyle = "#652851";
    this.ctx.fillText("X", this.posX + 54, this.poxY + 37);

    this.ctx.font = "30px Staatliches";
    this.ctx.fillStyle = "#652851";
    this.ctx.fillText(
      this.score,
      this.posX + 54 + 15,
      this.poxY + 37
    );
  },
};

const Timer = {
  gameTime: 0,
  seconds: 30,
  background: {
    width: 282,
    height: 65,
    imgObj: {},
    position: {
      // 141 half of width
      x: GAME_WIDTH / 2 - 141,
      y: 40,
    },
  },
  clock: {
    width: 52,
    height: 58,
    imgObj: {},
    position: {
      x: GAME_WIDTH / 2 - 282 / 3,
      y: 45,
    },
  },
  ctx: undefined,
  game: null,
  interval: null,
  init(ctx, game, configs) {
    this.gameTime = configs.gameTime / 1000;
    this.seconds = this.gameTime;
    this.ctx = ctx;
    const images = [
      {
        image: `${prefix}/cupidTrial/images/icon_countdown.png`,
        name: "clock",
      },
      {
        image: `${prefix}/cupidTrial/images/countdown_bg.png`,
        name: "background",
      },
    ];
    images.forEach((item) => {
      const resource = new Image();
      resource.src = item.image;
      this[item.name].imgObj = resource;

      resource.onload = () => {
        this.loading = false;
      };
    });
    this.game = game;
    this.configs = configs;
    this.startCountdown();
  },
  draw() {
    const {
      imgObj: clockImg,
      position: clockPosition,
      width: clockWidth,
      height: clockHeight,
    } = this.clock;
    const {
      imgObj: backgroundImg,
      position: backgroundPosition,
      width: backgroundWidth,
      height: backgroundHeight,
    } = this.background;
    this.ctx.drawImage(
      backgroundImg,
      backgroundPosition.x,
      backgroundPosition.y,
      backgroundWidth,
      backgroundHeight
    );
    this.ctx.drawImage(
      clockImg,
      clockPosition.x,
      clockPosition.y,
      clockWidth,
      clockHeight
    );
    this.drawScore();
    if (this.seconds < 1) {
      clearInterval(this.interval);
      this.interval = null;
      this.game.transport("gameover", this.game.Score.score);
    }
  },
  startCountdown() {
    this.interval = setInterval(() => {
      this.seconds -= 1;
    }, 1000);
  },
  drawScore() {
    const { position } = this.clock;
    const secondsOffset = {
      x: position.x + 60,
      y: position.y + 48,
    };
    const textSOffset = {
      x: secondsOffset.x + 50,
      y: secondsOffset.y,
    };

    // Text of remaining seconds;
    this.ctx.font = "40px Staatliches";
    this.ctx.fillStyle = "#FFCF12";
    this.ctx.strokeStyle = "#A34732";
    const remainingSeconds = String(this.seconds).padStart(2, "0");
    this.ctx.fillText(
      remainingSeconds,
      secondsOffset.x,
      secondsOffset.y
    );
    this.ctx.lineWidth = 1.8;
    this.ctx.strokeText(
      remainingSeconds,
      secondsOffset.x,
      secondsOffset.y
    );
    // Text of S
    this.ctx.font = "35px Staatliches";
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#A34732";
    this.ctx.lineWidth = 2.3;
    this.ctx.fillText("S", textSOffset.x, textSOffset.y);
    this.ctx.strokeText("S", textSOffset.x, textSOffset.y);
  },
  restart() {
    this.seconds = this.gameTime;
  },
};
const Event = {
  width: 1334,
  canRun: true,
  canvas: undefined,
  game: undefined,
  percent: undefined,
  isLoadingShoot: false,
  configs: {},
  init(canvas, game, configs) {
    this.configs = configs;
    this.canvas = canvas;
    canvas.addEventListener("touchstart", Event.touchStart);
    canvas.addEventListener("touchend", Event.touchEnd);
    window.addEventListener("keydown", Event.keyUp, true);
    this.game = game;
    this.percent = this.canvas.getBoundingClientRect().width / this.width;
  },
  touchStart(e) {
    e.preventDefault();
    if (!Event.canRun) {
      return;
    }
    const pos = Event.touchPos(e);
    if (Event.game.Outer.checkInBtn(pos.x, pos.y)) {
      Event.game.Outer.buttonInfo.press = true;
      Event.shoot();
    }
  },
  touchEnd(e) {
    e.preventDefault();
    Event.game.Outer.buttonInfo.press = false;
  },
  touchPos(e) {
    const touch = e.touches[0];
    return {
      x: parseInt(
        parseInt(
          touch.clientX - Event.canvas.getBoundingClientRect().left
        ) / Event.percent
      ),
      y: parseInt(
        parseInt(
          touch.clientY - Event.canvas.getBoundingClientRect().top
        ) / Event.percent
      ),
    };
  },
  shoot() {
    if (!this.isLoadingShoot) {
      this.game.Player.setShoot(this.configs.arrowSpeed);
      this.isLoadingShoot = true;
      setTimeout(() => {
        this.isLoadingShoot = false;
      }, this.configs.shootingInterval);
    }
  },
  keyUp(e) {
    e.preventDefault();
    if (e.code === "Space") {
      if (!Event.canRun) {
        return;
      }
      Event.game.Outer.buttonInfo.press = true;
      Event.shoot();
    }
  },
  restart() {
    this.canRun = true;
  },
};


// general config
let frameId;
let canvas;
let ctx;
const ctxWidth = 1334;
const ctxHeight = 750;

// FPS
let fps = 30;
let fpsInterval = 100 / fps;
let fpsLast;

let transport = undefined;

function setScreen() {
  canvas.width = ctxWidth;
  canvas.height = ctxHeight;
}

function setFps() {
  fpsLast = new Date().getTime();
}

function render() {
  frameId = window.requestAnimationFrame(render);
  let now = new Date().getTime();
  let elapsed = now - fpsLast;

  if (elapsed > fpsInterval) {
    fpsLast = now - (elapsed % fpsInterval);

    if (gameRunning) {
      main(elapsed);
    }
  }
}

window.game = {
  Background,
  Player,
  Score,
  Obstacle,
  Scene,
  Goal,
  Event,
  Timer,
};

let gameRunning = false;

const startGame = function (id, fn, configs) {
  canvas = document.getElementById(id);
  transport = fn;
  setFps();
  setScreen();
  ctx = canvas.getContext("2d");

  Background.init(ctx);
  Player.init(ctx, { Background, transport }, configs);
  Obstacle.init(ctx, { Score }, configs);
  Score.init(ctx, { transport });
  Outer.init(ctx, { Player });
  Scene.initArrow(ctx);
  Goal.init(ctx, { Score }, configs);
  Timer.init(ctx, { transport, Score }, configs);
  Event.init(
    canvas,
    { Player, Background, transport, Score, Outer },
    configs
  );

  gameRunning = true;
  render();
};
const stopGame = function () {
  window.cancelAnimationFrame(frameId);
};
const restartGame = function () {
  Score.restart();
  Event.restart();
  Player.restart();
  Goal.resetGoal();
  Timer.restart();
  Outer.restart();
  gameRunning = true;
};

function main(elapsed) {
  // clear canvas
  ctx.clearRect(0, 0, ctxWidth, ctxWidth);
  // draw canvas
  Background.draw();
  Timer.draw();
  Player.draw(elapsed);
  Obstacle.draw(elapsed);
  if (Goal.status === "moving") {
    Goal.draw(elapsed);
  }
  Outer.draw();
  Score.draw();
  if (Player.arrows.length > 0) {
    const goalPosition = { ...Goal.position };
    Player.arrows.forEach((arrow, index) => {
      if (detectCollision(arrow, Obstacle)) {
        transport("barrier");
        Player.arrows.splice(index, 1);
      } else if (detectCollision(arrow, Goal)) {
        arrow.hanging({
          x: goalPosition.x - Goal.width / 2 + 10,
          y: goalPosition.y + Goal.height / 2 - arrow.height / 2,
        });
        if (!arrow.onHit) {
          Goal.hit(elapsed);
          setTimeout(() => {
            Goal.onHit -= 1;
            Player.arrows = Player.arrows.filter(
              (item) => item.id !== arrow.id
            );
            if (Goal.onHit === 0) {
              Goal.resetGoal();
            }
          }, 500);
          arrow.onHit = true;
          Score.addScore(1);
          transport("goal");
        }
      } else {
        arrow.eject(elapsed);
      }
      // when arrow off screen, remove arrow.
      if (arrow.position.x > 1334) {
        Player.arrows.splice(index, 1);
      }
    });
  }
  if (Timer.seconds < 1) {
    stopGame();
  }
}

const app = Vue.createApp();
app.component('home', {
  template: `
    <div class="main">
      <start-page v-if="currentPage === 'start-page'" @button:start="changePage('game-loading')">
      </start-page>
      <game-loading v-if="currentPage === 'game-loading'"></game-loading>
      <game-main 
        ref="gameref" 
        v-show="currentPage === 'game-main'"
        @gameover="(params) => onGameover(params)"
        >
      </game-main>
      <game-result 
        v-if="currentPage === 'game-result'" 
        :result="result"
        @replay="replay"
        >
      </game-result>
    </div>
  `,
  data() {
    return {
      currentPage: 'start-page',
      result: 0,
    }
  },
  methods: {
    changePage(page) {
      this.currentPage = page;
      if (page === 'game-main') {
        this.$refs['gameref'].gameStart()
      }
    },
    onGameover(params) {
      this.changePage("game-result");
      this.result = params;
    },
    replay() {
      this.changePage('game-main')
    }
  },
  provide() {
    return {
      changePage: this.changePage,
    }
  },

})
app.component('cupid', {
  template: `<div class="cupid" @click="$emit('cupid:click')"></div>`
})
app.component('v-button', {
  props: {
    // default, secondary
    type: {
      type: String,
      default: () => "default",
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    isGameButton: {
      type: Boolean,
      default: () => false,
    },
  },
  methods: {
    handleClick() {
      this.$emit("button");
    },
  },
  template: `
    <button
      :class="['button', 'button--' + type, { disabled }]"
      @click="handleClick"
    >
      <slot></slot>
    </button>
  `
})
app.component('start-page', {
  template: `
    <div class="start-page">
      <div class='desc'> PC user press 'space' to shoot during the game </div>
      <div class="start-page__title"></div>
      <div class="start-page__nav"></div>
      <cupid class="start-page__cupid"></cupid>
      <div class='buttons'>
        <v-button 
          :is-game-button="true" 
          class="button button--start"
          @button="$emit('button:start')"
          >
          <span>Start</span>
          <span class="icon icon--bow"></span>
        </v-button>
      </div>
    </div>
  `
})

app.component('game-loading', {
  data() {
    return {
      preloadImgUrlList: [
        `${prefix}/cupidTrial/images/arrow.png`,
        `${prefix}/cupidTrial/images/btn_fire.png`,
        `${prefix}/cupidTrial/images/countdown_bg.png`,
        `${prefix}/cupidTrial/images/gold_coin.png`,
        `${prefix}/cupidTrial/images/icon_countdown.png`,
        `${prefix}/cupidTrial/images/stone.png`,
        `${prefix}/cupidTrial/images/target_active.png`,
        `${prefix}/cupidTrial/images/target.png`,
        `${prefix}/cupidTrial/images/cupid_sprite1.png`,
        `${prefix}/cupidTrial/images/cupid_sprite2.png`,
        `${prefix}/cupidTrial/images/cupid_sprite3.png`,
        `${prefix}/cupidTrial/images/cupid_sprite4.png`,
        `${prefix}/cupidTrial/images/cupid_sprite5.png`,
        `${prefix}/cupidTrial/images/bg.png`,
      ],
      maxPercent: 95,
      counter: 0,
    };
  },
  created() {
    this.counter = this.preloadImgUrlList.length;
    this.preloadImgUrlList.forEach((item) => {
      let image = new Image();
      image.src = item;
      image.onload = () => {
        this.counter--;
      };
    });
  },
  computed: {
    percentNum() {
      return Math.floor(
        (1 - this.counter / this.preloadImgUrlList.length) *
          this.maxPercent
      );
    },
    loadingHeartOffset() {
      return `translate(${this.percentNum * 16.3}%, -50%)`;
    },
    cupidOffset() {
      return `translateX(${this.percentNum * 3}%)`;
    },
    loadingFilled() {
      return `${this.percentNum * 0.98}%`;
    },
  },
  inject: ['changePage'],
  watch: {
    async counter(value) {
      if (value <= 0) {
        setTimeout(() => {
          this.maxPercent = 100;
        }, 500)
      }
    },
    async maxPercent(value) {
      if (value === 100) {
        setTimeout(() => {
          this.changePage("game-main");
        }, 500)
      }
    },
  },
  template: `
    <div class="game-loading loading-bg">
      <div class="loadingbar">
        <div class="loadingbar-layer">
          <div
            class="loadingbar-filled-container"
            :style="{ width: loadingFilled }"
          >
            <div class="loadingbar-filled"></div>
          </div>
          <div class="icon-container">
            <div
              class="icon icon--loading-heart"
              :style="{transform: loadingHeartOffset}"
            ></div>
          </div>
        </div>
        <cupid class="cupid" :style="{transform: cupidOffset}" />
      </div>
      <p class="percent">
        {{ percentNum }}<span class="smaller">%</span>
      </p>
    </div>
  `
})
app.component('game-main', {
  data() {
    return {
      canvasId: "gamescreen",
      showGame: false,
    }
  },
  methods: {
    async gameStart() {
      this.showGame = true;
      await Vue.nextTick();
      startGame(
        this.canvasId,
        this.transport,
        eventInfo
      );
    },
    transport(name, param) {
      if (name === "gameover") {
        restartGame();
        stopGame();
        this.$emit("gameover", param);
      }
    },
  },
  template: `
    <div ref="gameCanvas" :class="['game-main', { 'no-bg': showGame }]">
      <canvas :id="canvasId" class="game"></canvas>
    </div>
  `
})
app.component('game-result', {
  props: {
    result: {
      type: Number,
      default: 0,
    }
  },
  inject: ['changePage'],
  data() {
    return {
      screenshotMode: false,
    };
  },
  methods: {
    hanldeScreenshotView(status) {
      if (this.screenshotMode === status) return;
      this.screenshotMode = status;
    },
  },
  template: `
  <div class="result">
    <div class="mask"></div>
    <header class="result__header" v-if="!screenshotMode">
      <div class="icon icon--home" @click="changePage('start-page')"></div>
      <div
        class="icon icon--camera"
        @click="hanldeScreenshotView(true)"
      ></div>
    </header>
    <div
      :class="['result-content', { screenshot: screenshotMode }]"
      @click="hanldeScreenshotView(false)"
    >
      <div class="result-content__title">
        YOUR SCORE
      </div>
      <div class="result-content__score">
        <span class="icon icon--token"></span>
        <span class="times">X</span>
        <span class="score">{{ result }}</span>
      </div>
      <div class="result-content__rank" v-html="surspassText"></div>
      <template v-if="!screenshotMode">
        <v-button class="replay" @button="$emit('replay')">
          <span class="icon icon--refresh"></span>
          <span class="replay__lable">
            REPLAY
          </span>
        </v-button>
      </template>
    </div>
    <cupid />
  </div>
  `
})

app.mount('#app')
