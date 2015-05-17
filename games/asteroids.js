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

    // TODO: load here the assets for the game
    this.game.load.image('background', '../assets/images/background.png');
    this.game.load.image('ship', '../assets/images/ship.png');
  },

  create: function () {
    this.game.state.start('play');
  }
};

//
// Main scene
//

var PlayScene = {
  create: function () {
    // background
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

    this.ship = new Ship(this.game, 320, 240);
    this.game.add.existing(this.ship);

    // setup keys
    this.keys = this.game.input.keyboard.createCursorKeys();
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
  }
};

//
// Sprites
//

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

window.onload = function () {
  var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
