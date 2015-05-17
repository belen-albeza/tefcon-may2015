//
// Preloader & boot scenes
//

var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    this.game.load.image('preloader_bar', '../assets/images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // load assets for the game
    this.game.load.image('background', '../assets/images/background.png');
    this.game.load.image('ship', '../assets/images/ship.png');
    this.game.load.image('laser', '../assets/images/laser.png');
    this.game.load.image('asteroid', '../assets/images/asteroid.png');
  },

  create: function () {
    this.game.state.start('play');
  }
};

//
// Main scene
//

ASTEROID_AMOUNT = 3;

var PlayScene = {
  create: function () {
    // background
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

    this.ship = new Ship(this.game, 320, 240);
    this.game.add.existing(this.ship);

    this.bullets = this.game.add.group();
    this.asteroids = this.game.add.group();

    this.spawnAsteroids(ASTEROID_AMOUNT);

    // setup keys
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.keys.spacebar.onDown.add(function () {
      this.ship.shoot(this.bullets);
    }.bind(this));
  },

  update: function () {
    //
    // handle player input
    //

    // turn ship
    if (this.keys.left.isDown) {
      this.ship.turn(-1);
    }
    else if (this.keys.right.isDown) {
      this.ship.turn(1);
    }
    else {
      this.ship.turn(0);
    }

    // move and stop ship
    this.ship.move(this.keys.up.isDown ? 1 : 0);
  },

  spawnAsteroids: function (amount) {
    for (var i = 0; i < amount; i++) {
      this.asteroids.add(new Asteroid(
        this.game,
        this.game.rnd.between(0, this.game.width),
        this.game.rnd.between(0, this.game.height)
      ));
    }
  }
};

//
// Sprites
//

// Ship

function Ship(game, x, y) {
  // call Phaser constructor
  Phaser.Sprite.call(this, game, x, y, 'ship');

  this.anchor.setTo(0.5, 0.5);

  // setup physics
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity.setTo(Ship.MAX_SPEED, Ship.MAX_SPEED);
  this.body.drag.setTo(Ship.DRAG, Ship.DRAG);
}

Ship.ROTATION_SPEED = 180; // degrees / second
Ship.ACCELERATION = 200; // pixels / second^2
Ship.MAX_SPEED = 300; // pixels / second (per axis)
Ship.DRAG = 50; // pixels / second

Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.turn = function (direction) {
  this.body.angularVelocity = direction * Ship.ROTATION_SPEED;
};

Ship.prototype.move = function (direction) {
  this.body.acceleration.setTo(
    Math.cos(this.rotation - Math.PI / 2) * Ship.ACCELERATION * direction, // x
    Math.sin(this.rotation - Math.PI / 2) * Ship.ACCELERATION * direction  // y
  );
};

Ship.prototype.shoot = function (group) {
  var bullet = new Bullet(this.game, this.x, this.y, this.rotation);
  group.add(bullet);
};

Ship.prototype.update = function () {
  wrapSprite(this);
};


// Bullet

function Bullet(game, x, y, rotation) {
  // call Phaser constructor
  var offset = 30;
  Phaser.Sprite.call(this, game,
    x + Math.cos(rotation - Math.PI / 2) * offset,
    y + Math.sin(rotation - Math.PI / 2) * offset,
    'laser'
  );

  this.anchor.setTo(0.5, 0.5);
  this.rotation = rotation;

  // enable physics
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.velocity.setTo(
    Math.cos(rotation - Math.PI / 2) * Bullet.SPEED,
    Math.sin(rotation - Math.PI / 2) * Bullet.SPEED
  );
}

Bullet.SPEED = 350;

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

// Asteroid

function Asteroid(game, x, y) {
  // call Phaser constructor
  Phaser.Sprite.call(this, game, x, y, 'asteroid');

  this.anchor.setTo(0.5, 0.5);

  // setup physics
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.angularVelocity = game.rnd.between(Asteroid.MIN_ROTATION_SPEED,
    Asteroid.MAX_ROTATION_SPEED);
  var angle = game.rnd.realInRange(0, 2 * Math.PI);
  this.body.velocity.setTo(
    Math.cos(angle) * Asteroid.SPEED,
    Math.sin(angle) * Asteroid.SPEED
  );
}

Asteroid.MIN_ROTATION_SPEED = 10;
Asteroid.MAX_ROTATION_SPEED = 100;
Asteroid.SPEED = 100;

Asteroid.prototype = Object.create(Phaser.Sprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.update = function () {
  wrapSprite(this);
};

//
// Utils
//

function wrapSprite(sprite) {
  // wrap in world bounds
  if (sprite.x > sprite.game.width)  { sprite.x = 0; }
  if (sprite.y > sprite.game.height) { sprite.y = 0; }
  if (sprite.x < 0) { sprite.x = sprite.game.width; }
  if (sprite.y < 0) { sprite.y = sprite.game.height; }
}

window.onload = function () {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
