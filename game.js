// This example uses the Phaser 2.0.4 framework

//-----------------------------------------------------------------------------
//BOOTYHUNTER: A SWASHBUCKLING ADVENTURE
//Concept by Blake Erquiaga
//Written by Blake Erquiaga, Dan Zweiner, Jason Watts, Liem Gearen
//Special thanks to Dr. Thomas Houpt and Dr. Forrest Stonedahl

//global variables
var player1;//represents playable character
var width = 960, height = 650;
var playerKills = 0;
var score = 0;
var fireButtonHeld = 0;

//wind global variables
var wind = 'S'; //the direction the wind is coming from. N means the wind blows north to south, N,S,E,W
var direction = 'C'; //P, S, U, D
var startWake = 0;

//enemy global variables
var wave;
var numEnemies;
var killedBosses = [];
var enemyDownWindSpeed = {'gunboat': 100, 'manowar': 500, 'normal': 850, 'dhow': 950};
var enemyCrossWindSpeed = {'gunboat': 60, 'manowar': 250, 'normal': 500, 'dhow': 600};
var enemyUpWindSpeed = {'gunboat': 35, 'manowar': 100, 'normal': 150, 'dhow': 250};
var enemyHealth = {'gunboat': 1, 'manowar': 12, 'normal': 6, 'dhow': 3};
var enemyDifficulty = {'gunboat': 1, 'manowar': 10, 'normal': 5, 'dhow': 10};
var waveDifficulty;

//-----------------------------------------------------------------------------

var GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
  //  this.game.load.spritesheet('ship', 'assets/gfx/ship.png', 32, 32);
    this.game.load.spritesheet('ship', 'assets/boatLoRes.png', 38, 32);
    this.game.load.image('cannonball', 'assets/cannonball.png');
    this.game.load.image('whitecap', 'assets/whitecap.png');
    this.game.load.spritesheet('gunboat', 'assets/gunBoat.png', 15, 19);
    this.game.load.spritesheet('manowar', 'assets/manOwar.png', 59, 32);
    this.game.load.spritesheet('normal', 'assets/enemyBoatLoRes.png', 38, 32);
    this.game.load.spritesheet('dhow', 'assets/dhow.png', 40, 32);
    this.game.load.image('silverCoin', 'assets/silverCoin.png');
    this.game.load.image('goldCoin', 'assets/goldCoin.png');
    this.game.load.image('emerald', 'assets/emerald.png');
    this.game.load.image('purpleGem', 'assets/purpleGem.png');
    this.game.load.image('diamond', 'assets/diamond.png');
    console.log("Hello world");
};

// Setup the example
GameState.prototype.create = function() {
    // Set stage background color
//    this.game.stage.backgroundColor = 0x111111;


  //TODO: remove redundant code
  this.numEnemies = 0;
  this.wave = 0;
  this.waveDifficulty = 2;
  console.log("wave: " + wave + " waveDifficulty: " + waveDifficulty);

  this.playerKills = 0;
  //console.log("kills: " + playerKills);

  this.fireButtonHeld = 0;

  //adds islands to map
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.islands = this.game.add.group();
    this.islands.enableBody = true;
    generateIslands(width, height, 20, 100, 'ship', this.islands);

    //creates whitecaps group
    this.whitecaps = this.game.add.group();
    this.whitecaps.enableBody = true;

    //creates enemies group
    this.enemies = this.game.add.group();
    this.enemies.enableBody = true;

    // Define motion constants
    this.ROTATION_SPEED = 180; // degrees/second
    this.ACCELERATION = 90; // pixels/second/second
    this.MAX_SPEED = 850; // pixels/second. This is the max max speed in the game
    this.DRAG = 50; // pixels/second
    this.wake = this.startWake; // starting wake sprite

    // Add the ship to the stage
    player1 = new ship(this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'ship'));
    
    /*this.ship.health = 6;//moved to ship.js
    //this.ship.setHealth(6);
    //this.ship.anchor.setTo(0.5, 0.5);
    //this.ship.angle = -90; // Point the ship up
    //this.ship.enableBody = true;*///all of this was moved to ship.js
    

    //console.log(this.game.add);
    //first weapon, fires right relative to the ship
    this.weapon = this.game.add.weapon(100, 'cannonball');
    this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    this.weapon.bulletLifespan = 650;
    this.weapon.bulletSpeed = 600;
    this.weapon.fireRate = 10;
    this.weapon.bulletAngleVariance = 10;
    this.weapon.bulletCollideWorldBounds = false;
    this.weapon.bulletWorldWrap = true;
    this.weapon.trackSprite(player1.sprite, 0, 0, false);//TODO: shift over to actual position of gun
    //second weapon, fires left relative to the ship
    this.weapon2 = this.game.add.weapon(100, 'cannonball');
    this.weapon2.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    this.weapon2.bulletLifespan = 650;
    this.weapon2.bulletSpeed = 600;
    this.weapon2.fireRate = 10;
    this.weapon2.bulletAngleVariance = 10;
    this.weapon2.bulletCollideWorldBounds = false;
    this.weapon2.bulletWorldWrap = true;
    this.weapon2.trackSprite(player1.sprite, 0, 0, false);//TODO: shift over to actual position of gun

    // Enable physics on the ship
    this.game.physics.enable(player1.sprite, Phaser.Physics.ARCADE);
    player1.enablePhysics();

    // Set maximum velocity
    //this.ship.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED); // x, y// Moved to ship.js

    // Add drag to the ship that slows it down when it is not accelerating
    //this.ship.body.drag.setTo(this.DRAG, this.DRAG); // x, y
    //A game decision was made that the ship doesn't slow down unless it crashes


    // Capture certain keys to prevent their default actions in the browser.
    // This is only necessary because this is an HTML5 game. Games on other
    // platforms may not need code like this.
    this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.A,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.D,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.W,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.S,
        Phaser.Keyboard.SPACEBAR

    ]);
    //this.ship.body.collideWorldBounds = false;//lets the ship wrap around the world

};





// The update() method is called every frame
GameState.prototype.update = function () {
    this.weapon.fireAngle = player1.sprite.angle + 90; //make the shots fire sideways
    this.weapon2.fireAngle = player1.sprite.angle - 90;
  //keeps a steady flow of whitecaps on the screen
  generateWhitecaps(1, 45, this.whitecaps);
  //collides whitecaps with the world
  game.physics.arcade.overlap(player1, this.whitecaps, whiteCapHitShip);
  game.physics.arcade.overlap(this.islands, this.whitecaps, whiteCapHitIsland);
  game.physics.arcade.overlap(this.enemies, this.whitecaps, whiteCapHitShip);
//  game.physics.arcade.overlap(this.enemies, this.islands, enemyHitIsland);

  game.physics.arcade.overlap(this.islands, this.weapon.bullets, islandWasShot);
  game.physics.arcade.overlap(this.islands, this.weapon2.bullets, islandWasShot);

  game.physics.arcade.overlap(this.enemies, this.weapon.bullets, enemyWasShot);
  game.physics.arcade.overlap(this.enemies, this.weapon2.bullets, enemyWasShot);

  game.physics.arcade.collide(this.ship, this.enemies);//TODO: add function to check if the player is invincible

  if (this.wave === 0){
    this.wave = 1;
    this.waveDifficulty = 3;
    this.numEnemies = generateEnemies(this.waveDifficulty, this.wind, this.enemies, true);
  }
  console.log(this.playerKills);

  //TODO: refactor into separate method
  //checks the direction the ship is going, and checks it agianst the wind to
  //determine what sprites the ship should be using
  if (player1.sprite.angle >= 45 && player1.sprite.angle <135){ //ship pointing south

      this.direction = checkWind('S');
      switch(this.direction){
        case 'D': this.startWake = 0; break;
        case 'P': this.startWake = 6; break;
        case 'S': this.startWake = 3; break;
        default:
          this.startWake = 9;
    }
  } else if ((player1.sprite.angle >= 135 && player1.sprite.angle <225) || (player1.sprite.angle >= -225 && player1.sprite.angle < -135)){//ship pointing west
      this.direction = checkWind('W');
      switch(this.direction){
        case 'D': this.startWake = 0; break;
        case 'P': this.startWake = 6; break;
        case 'S': this.startWake = 3; break;
        default:
          this.startWake = 9;
    }
  } else if ((player1.sprite.angle < -45 && player1.sprite.angle >= -135)|| (player1.sprite.angle < 315 && player1.sprite.angle >= 225)){//ship pointing north
      this.direction = checkWind('N');
      switch(this.direction){
        case 'D': this.startWake = 0; break;
        case 'P': this.startWake = 6; break;
        case 'S': this.startWake = 3; break;
        default:
          this.startWake = 9;
    }
  } else {//east
      this.direction = checkWind('E');
      switch(this.direction){
        case 'D': this.startWake = 0; break;
        case 'P': this.startWake = 6; break;
        case 'S': this.startWake = 3; break;
        default:
          this.startWake = 9;
    }
  }

  switch(this.direction){
    case 'U':
      if (this.MAX_SPEED > 150){
        this.MAX_SPEED = this.MAX_SPEED - 10;
      } else {
        this.MAX_SPEED = 150;
      }
      this.ACCELERATION = 30;//previously 50
      break;
    case 'D':
    if (this.MAX_SPEED < 650){//previously 850
      this.MAX_SPEED += 20;
    } else {
      this.MAX_SPEED = 650;
    }
    this.ACCELERATION = 180;
      break;
    default://P or S
    if (this.MAX_SPEED < 300){//previously 500
      this.MAX_SPEED += 10;
    } else if (this.MAX_SPEED > 300){
      this.MAX_SPEED -= 10;
    } else {
      this.MAX_SPEED = 300;
    }
      this.ACCELERATION = 90;
  }

  if (player1.sprite.body.velocity.x > this.MAX_SPEED){
    player1.sprite.body.velocity.x -= 10;
  }
  if (player1.sprite.body.velocity.y > this.MAX_SPEED){
    player1.sprite.body.velocity.y -= 10;
  }

    //  Collide the ship with the islands
    game.physics.arcade.collide(player1.sprite, this.islands, playerHitIsland);


    if (this.game.time.fps !== 0) {
       // this.fpsText.setText(this.game.time.fps + ' FPS');

        this.fpsText.setText(frontier + ' FPS');

    }

    // Keep the ship on the screen
    if (player1.sprite.x > this.game.width) player1.sprite.x = 0;
    if (player1.sprite.x < 0) player1.sprite.x = this.game.width;
    if (player1.sprite.y > this.game.height) player1.sprite.y = 0;
    if (player1.sprite.y < 0) player1.sprite.y = this.game.height;



    var speed = Math.sqrt((player1.sprite.body.velocity.x * player1.sprite.body.velocity.x) + (player1.sprite.body.velocity.y * player1.sprite.body.velocity.y));
    var acceleration = Math.sqrt(player1.sprite.body.acceleration.x * player1.sprite.body.acceleration.x) + (player1.sprite.body.acceleration.y * player1.sprite.body.acceleration.y);

    if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)  || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
        // If the LEFT key is down, rotate left
        player1.sprite.body.angularVelocity = -this.ROTATION_SPEED;
        player1.sprite.body.velocity.x = Math.cos(player1.sprite.rotation) * speed;
        player1.sprite.body.velocity.y = Math.sin(player1.sprite.rotation) * speed;
        player1.sprite.body.acceleration.x = Math.cos(player1.sprite.rotation) * acceleration;
        player1.sprite.body.acceleration.y = Math.sin(player1.sprite.rotation) * acceleration;

    } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)  || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
        // If the RIGHT key is down, rotate right
        player1.sprite.body.angularVelocity = this.ROTATION_SPEED;

        player1.sprite.body.velocity.x = Math.cos(player1.sprite.rotation) * speed;
        player1.sprite.body.velocity.y = Math.sin(player1.sprite.rotation) * speed;
        player1.sprite.body.acceleration.x = Math.cos(player1.sprite.rotation) * acceleration;
        player1.sprite.body.acceleration.y = Math.sin(player1.sprite.rotation) * acceleration;

    } else {
        // Stop rotating
        player1.sprite.body.angularVelocity = 0;
    }


    if (this.input.keyboard.isDown(Phaser.Keyboard.UP)  || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
        // If the UP key is down, thrust

        // Calculate acceleration vector based on this.angle and this.ACCELERATION
        player1.sprite.body.acceleration.x = Math.cos(player1.sprite.rotation) * this.ACCELERATION;
        player1.sprite.body.acceleration.y = Math.sin(player1.sprite.rotation) * this.ACCELERATION;

        //TODO: figure out why the partially accelerated sprite isn't used
      	this.wake = !this.wake;
        //console.log("start wake: " + this.startWake);
        // Show the frame from the spritesheet with the engine on
        //console.log("start wake " + this.startWake);
        if (player1.sprite.body.velocity <= 50){
          this.wake = this.startWake;
        } else if (player1.sprite.body.velocity <= 300){
          this.wake = this.startWake + 1;
        } else {
          this.wake = this.startWake + 2;
        }
        if (this.wake > this.startWake + 3 || this.wake < this.startWake){
          this.wake = this.startWake;
        }
      player1.sprite.frame = this.wake;

    }  else if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN) || this.input.keyboard.isDown(Phaser.Keyboard.S)) {

		// break...
      //  player1.sprite.body.acceleration.setTo(0, 0);
        // player1.sprite.body.velocity.setTo(0, 0);

        // Show the frame from the spritesheet with the engine off
      //  player1.sprite.frame = 0;

	} else {
        // Otherwise, stop thrusting
        player1.sprite.body.acceleration.setTo(0, 0);

        // Show the frame from the spritesheet with the engine off
        player1.sprite.frame = this.startWake;
    }

//shoot both guns
  if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    this.weapon.fire();
    this.weapon2.fire();
    this.fireButtonHeld++;
  } else { //reduce the fireButtonHeld value
      if (this.fireButtonHeld > 0)
        this.fireButtonHeld -= 1; //TODO: balance cooldown time vs spam time. Should it be longer? Should it be shorter?
      if (this.fireButtonHeld < 0)
        this.fireButtonHeld = 0;
  }

  //modifies weapon effectiveness based on the number of playerKills
  /*if (playerKills > 14){//maybe 34 and 100 instead of 14 and 41?
    this.weapon.fireLimit = 41;
    this.weapon2.fireLimit = 41;
  } else {
    this.weapon.fireLimit = 3* (playerKills + 1);
    this.weapon2.fireLimit = 3 * (playerKills + 1);
  }
  //since both weapons fire at the same time, we only need to check the one weapon's shots
  if (this.weapon.shots === this.weapon.fireLimit){
    game.time.events.add(3000, this.weapon.resetShots());
    game.time.events.add(3000, this.weapon2.resetShots());
  }*/
  if (playerKills >= 10){
    this.weapon.bulletLifespan = 650;
    this.weapon2.bulletLifespan = 650;
  } else {
    this.weapon.bulletLifespan = 200 + 50 * (playerKills);
    this.weapon2.bulletLifespan = 200 + 50 * (playerKills);
  }

    //forces the player to not hold down the fire button by reducing the fireRate
    //originally wanted this in a separate function, but it didn't work for some reason
    //TODO: balance out the spam time value. Is 90 too long? Is it too short?
    //TODO: balance out slow down rate. Is 10% of the fireButtonHeld time too harsh?
      var newFireRate = 10;
      if (this.fireButtonHeld >= 90){
        newFireRate = newFireRate * (this.fireButtonHeld/10);
      }
    this.weapon.fireRate = newFireRate;
    this.weapon2.fireRate = newFireRate;


  //changes the color of the ocean depending on the health of the player.
  if(player1.health < 1) {
    player1.health = 1;
  }
  switch(player1.health){
    case 0:
      console.log("You'd be dead if this game was finished");//run game over sequence...show score, kills ,wave,
      //maybe a fun historically accurate pirate fact too
      break;
    case 1:
      this.game.stage.backgroundColor = 0x0d2344//very dark sea
      break;
    case 2:
      this.game.stage.backgroundColor = 0x0b2c5e// dark sea, #0b2c5e
      break;
    case 3:
      this.game.stage.backgroundColor = 0x124375//moderately dark sea
      break;
    case 4:
      this.game.stage.backgroundColor = 0x136875//dark blue-green sea
      break;
    case 5:
      this.game.stage.backgroundColor = 0x14899b;//blue-green sea
      break;
    case "invincible":
      this.game.stage.backgroundColor = 0xb52012;//invincibility power-up, red sea
      break;
    default://default health is 6.
      this.game.stage.backgroundColor = 0x019ab2;// caribbean teal sea
  }


  //if there are no enemies, then the game moves to the next wave

  if (this.numEnemies <= 0){
    this.wave++;
    this.waveDifficulty = this.waveDifficulty * 1.5;
    this.numEnemies = generateEnemies(this.waveDifficulty, this.wind, this.enemies, false);
  }

};

function generateEnemies(waveDifficulty, wind, enemies, isFirstWave){
  if (isFirstWave){
    initializeEnemy('gunboat', wind, enemies);
    initializeEnemy('gunboat', wind, enemies);
    return 2;
  } else {
  var newNumEnemies = 0;
  for (var i = 0; i <= waveDifficulty; i++){
    //TODO: find a way to weight the selection to favor a certain type of enemy if one of that type has already been added to the wave
    var shipChosen = false;
    if ((waveDifficulty - i) >= 10 && !shipChosen){ //difficulty value of the man o' war and dhow
        var useThisSprite = Math.random()>0.5?true:false; //TODO: balance freequency of selecting hardest available enemy
        if (useThisSprite){
          shipChosen = true;
          var useDhow =  Math.random()>0.5?true:false; //determines whether to use dhow or man o' war
          if (useDhow){//create a dhow
            initializeEnemy('dhow', wind, enemies);
            i += 10;
            this.newNumEnemies++;
            break;
          } else {// create a man o war
            initializeEnemy('manowar', wind, enemies);
            i +=10;
            this.newNumEnemies++;
            break;
          }
        }
    }
    if ((waveDifficulty - i) >= 5 && !shipChosen){
      var useThisSprite = Math.random()>0.5?true:false;//TODO: balance freequency of selecting hardest available enemy
      if (useThisSprite){
        shipChosen = true;
        initializeEnemy('normal', wind, enemies);
        i += 5;
        this.newNumEnemies++;
        break;
      }
    }
    if (!shipChosen){//no other ship was chosen and/or the remaining difficulty value is too low
      shipChosen = true;
      initializeEnemy('gunboat', wind, enemies);
      i ++;
      this.newNumEnemies++;
      break;
    }
  }
  return newNumEnemies;
}
}

  //function to kill bullets when they hit islands. I couldn't get it working,
  //so it's commented out

  function islandWasShot(island, bullet){
    bullet.kill();
    //TODO: add explosion
    //play explosion sound
    /*
    var explosion = explosions.getFirstExists(false);

    explosion.reset( bullet.body.x ,bullet.body.y);
    explosion.play('explosion', 10, false, true);
    explosion_sound.play("",0,.5,false,true);
    */
  }

  function enemyWasShot(enemy, bullet){
    bullet.kill();
    enemy.health--;
    console.log("bang! " + enemy.health);
    //TODO: add explosion
    //play explosion sound

    if (enemy.health <= 0){
      enemy.kill();
      this.playerKills++;
      //play explosion and sound
      //spawn treasure
    }
  }


function generateIslands(width, height, maxIslands, maxSize, tank, islands) {
  var numIslands = Math.random() * maxIslands;

for (var i = 0; i < numIslands; i++){
  var radius1 = Math.random() * maxSize;
  var radius2 = Math.random() * maxSize;
  var x = Math.random() * width;
  var y = Math.random() * height;
  var isDesert = Math.random()>0.5?true:false;
  //var rotation = Math.random() * 45;
  var graphics = this.game.add.graphics(0, 0);


  graphics.lineStyle(8, 0xffd900);
  if (isDesert === true){
    graphics.beginFill(0xffd900);
  } else {
    graphics.beginFill(0x249930);
  }
  graphics.drawRect(x, y, radius1, radius2);
  island = createIsland(x, y, radius1, radius2);
  islands.add(island);

}

function createIsland(x, y, radius1, radius2) {

    // create a new bitmap data object
    var bmd = this.game.add.bitmapData(radius1,radius2);
    // draw to the canvas context like normal
    bmd.ctx.beginPath();
    bmd.ctx.rect(x,y,radius1,radius2);
    bmd.ctx.fill();

    // use the bitmap data as the texture for the sprite
    var island = this.game.add.sprite(x, y, bmd);
    this.game.physics.arcade.enable(island);
    island.enableBody = true;
    island.body.collideWorldBounds = true;
    island.body.checkCollision.up = true;
	  island.body.checkCollision.down = true;
    island.body.immovable = true;
    //island.body.loadpolygon()
    return island;
}

}


//implements whitecaps, which are ocean waves that tell the player where the wind is coming from
function generateWhitecaps(numWhiteCaps, speed, whitecaps){
  var makeOrNot = Math.random()>0.02?false:true; //keeps the screen from being completely full of them
   if (makeOrNot){
    switch(this.wind){//find the wind direction
      case 'N':
      for (var i = 0; i < numWhiteCaps; i++){
          game.time.events.add(Math.random() * 10000, function(){
            var x = Math.random() * this.width;
            var y = 0;
            var angle = 0;
            var xSpeed = 0;
            var ySpeed = speed;
            var whitecap = this.game.add.sprite(x, y, 'whitecap');
            this.game.physics.enable(whitecap, Phaser.Physics.ARCADE);
            whitecap.body.velocity.x = xSpeed;
            whitecap.body.velocity.y = ySpeed;
            whitecap = initializeWhitecap(whitecap, angle); //add whitecap, correct angle
            whitecaps.add(whitecap);
          });
      }
      break;
      case 'S':
      for (var i = 0; i < numWhiteCaps; i++){
          game.time.events.add(Math.random() * 10000, function(){
            var x = Math.random() * this.width;
            var y = this.height;
            var angle = 0;
            var xSpeed = 0;
            var ySpeed = 0 - speed;
            var whitecap = this.game.add.sprite(x, y, 'whitecap');
            this.game.physics.enable(whitecap, Phaser.Physics.ARCADE);
            whitecap.body.velocity.x = xSpeed;
            whitecap.body.velocity.y = ySpeed;
            whitecap = initializeWhitecap(whitecap, angle); //add whitecap, correct angle
            whitecaps.add(whitecap);
          });
        }
      break;
      case 'W':
      for (var i = 0; i < numWhiteCaps; i++){
          game.time.events.add(Math.random() * 10000, function(){
            var x = 0;
            var y = Math.random() * this.height;
            var angle = 90;
            var xSpeed = speed;
            var ySpeed = 0;
            var whitecap = this.game.add.sprite(x, y, 'whitecap');
            this.game.physics.enable(whitecap, Phaser.Physics.ARCADE);
            whitecap.body.velocity.x = xSpeed;
            whitecap.body.velocity.y = ySpeed;
            whitecap = initializeWhitecap(whitecap, angle); //add whitecap, correct angle
            whitecaps.add(whitecap);
          });
        }
        break;
      default: //east
      for (var i = 0; i < numWhiteCaps; i++){
          game.time.events.add(Math.random() * 10000, function(){
            var x = this.width;
            var y = Math.random() * this.height;
            var angle = -90;
            var xSpeed = 0 - speed;
            var ySpeed = 0;
            var whitecap = this.game.add.sprite(x, y, 'whitecap');
            this.game.physics.enable(whitecap, Phaser.Physics.ARCADE);
            whitecap.body.velocity.x = xSpeed;
            whitecap.body.velocity.y = ySpeed;
            whitecap = initializeWhitecap(whitecap, angle); //add whitecap, correct angle
            whitecaps.add(whitecap);
    });//end of delay
  }//end of loop
}//end of switch
}//end of conditional

function initializeWhitecap(whitecap, angle){
  whitecap.lifespan = 23000;//kills the whitecap after it leaves the screen
  whitecap.anchor.setTo(0.5, 0.5);
  whitecap.angle = angle;
  whitecap.enableBody = true;
  this.game.physics.enable(whitecap, Phaser.Physics.ARCADE);
  whitecap.body.collideWorldBounds = false;
  whitecap.body.width = 75;
  whitecap.body.height = 56;
  return whitecap;

  //in case we want to have animated whitecaps instead of static ones
  //whitecap.frame = Math.floor(Math.random() * 5);
  //whitecap.waveForm = Math.random() > 0.5 ? 1 : -1;

}

}



//helper function to change the acceleration and top speed of the ship based on its direction
function checkWind(facing){
  switch(facing){//default is east
    case 'N':
      switch(wind){ //default is east
        case 'N':  return 'U'; break;
        case 'S': return 'D'; break;
        case 'W': return 'P'; break;
        default: return 'S';
      } break;
    case 'S':
      switch(wind){
        case 'N': return 'D'; break;
        case 'S': return 'U'; break;
        case 'W': return 'S'; break;
        default:  return 'P';
      } break;
    case 'W':
      switch(wind){
        case 'N':  return 'S'; break;
        case 'S':  return 'P'; break;
        case 'W': return 'U'; break;
        default: return 'D';
      } break;
    default:
      switch(wind){
        case 'N':  return 'P'; break;
        case 'S': return 'S'; break;
        case 'W':  return 'D'; break;
        default:  return 'U';
      }
  }
}



function whiteCapHitIsland(island, whitecap){
  whitecap.kill();
    //TODO: make wave crashing sound?
    //TODO: create explosion animation for whitecaps
    //var explosion = explosions.getFirstExists(false);
    //explosion.play('whitecapSound', 10, false, true);
    //explosion_sound.play("",0,.5,false,true);
//  generateWhitecaps(1,45, this.whitecaps);
}

function whiteCapHitShip(ship, whitecap){
  whitecap.kill();
    //TODO: make wave crashing sound?
    //TODO: create explosion animation for whitecaps
    //var explosion = explosions.getFirstExists(false);
    //explosion.play('whitecapSound', 10, false, true);
    //explosion_sound.play("",0,.5,false,true);
//  generateWhitecaps(1,45, this.whitecaps);
}

//damages the ship, after crashing into an island
function playerHitIsland(ship, island){
    //ship.damage(1);
    player1.health--;
    //TODO: add sound for when the player is hit
    //TODO: add "explosion" of water/sand pixels?
    //console.log("We've been hit, Captain! " + ship.health);
  }

  function enemyHitIsland(enemy, island){
    enemy.health--;
    //TODO: copy whatever the playerHitisland function does
    if (enemy.health <= 0){
      enemy.kill();
      this.playerKills++;
      //TODO: spawn treasure, explosion, sound
    }
  }

  function initializeEnemy(type, wind, enemies) {
    //TODO: refactor random direction code into separate function
    var x = 0;
    var y = 0;
    var xVelocity = 0;
    var yVelocity = 0;
    var angle = 0;
    var randDirection = Math.random();
    switch(wind){
      case 'N': //should come from E, W, or N
        if (randDirection < 0.33){ // come from the east edge
          y = Math.random() * this.height;
          x = this.width;
          angle = 180;
          xVelocity = this.enemyCrossWindSpeed[type];
        } else if (randDirection < 0.66){ //come from the west edge
          y = Math.random() * this.height;
          xVelocity = this.enemyCrossWindSpeed[type];
        } else { //come from the north edge
        x = Math.random() * this.width;
        angle = -90;
        yVelocity = this.enemyDownWindSpeed[type];
      }
      break;
      case 'S': //should come come from E, W, or S
        if (randDirection < 0.33){// come from the east edge
          y = Math.random() * this.height;
          x = this.width;
          angle = 180;
          xVelocity = this.enemyCrossWindSpeed[type];
        } else if (randDirection < 0.66){ //come from the west edge
          y = Math.random() * this.height;
          xVelocity = this.enemyCrossWindSpeed[type];
        } else {   //come from the south edge
          x = Math.random() * this.width;
          y = this.height;
          angle = 90;
          yVelocity = 0 - this.enemyDownWindSpeed[type];
        }
      break;
      case 'W'://should come from N, S, or W
        if (randDirection < 0.33){ //come from the north edge
          x = Math.random() * this.width;
          angle = -90;
          yVelocity = this.enemyCrossWindSpeed[type];
        } else if (randDirection < 0.66){ //come from the south edge
          x = Math.random() * this.width;
          y = this.height;
          angle = 90;
          yVelocity = 0 - this.enemyCrossWindSpeed[type];
        } else { //come from the west edge
        y = Math.random() * this.height;
        xVelocity = this.enemyDownWindSpeed[type];
      }
      break;
      default://east, should come from N,S, or E
        if (randDirection < 0.33){ //come from the north edge
          x = Math.random() * this.width;
          angle = -90;
          yVelocity = this.enemyCrossWindSpeed[type];
        } else if (randDirection < 0.66){ //come from the south edge
          x = Math.random() * this.width;
          y = this.height;
          angle = 90;
          yVelocity = 0 - this.enemyCrossWindSpeed[type];
        } else {//come from the east edge
          y = Math.random() * this.height;
          x = this.width;
          angle = 180;
          xVelocity = this.enemyDownWindSpeed[type];
        }
    }
    var enemy = this.game.add.sprite(x, y, type);
    //TODO: add weapons to enemies depending on their type
    enemy.frame = 0;
    enemy.anchor.setTo(0.5, 0.5);
    enemy.angle = angle;
    this.game.physics.enable(enemy, Phaser.Physics.ARCADE);// What are these "this" refering to???
    enemy.enableBody = true;
    enemy.body.collideWorldBounds = false;
    enemy.body.velocity.x = xVelocity;
    enemy.body.velocity.y = yVelocity;
  //  enemy.body.bounce.set(0.25);
    enemy.health = this.enemyHealth[type];
    enemies.add(enemy);
    this.numEnemies++;//doesn't work
  }

  function gameOverSequnce(score, wave, kills, bossesKilled) {
      //TODO Explosion sprite

      //TODO Kill ship

      //TODO Change the current screen to an GameOver Screen with
      //score, wave, kills and bossesKilled
  }


GameState.prototype.render =function() {
  this.weapon.debug();
}

/*TODO: Long-term goals
-add enemiy ships
-make enemy ships avoid islands, move towards the player, and turn to shoot when in range
-implement power-ups: temporary invincibility(red sea), health, ability to slow down,
 and ability to launch a boarding pirate that one-hits enemy ships
 -implement score: killed enemies drop loot, and loot  washes in from the direction of the wind,
 and must be picked up to score points.
 -implement waves of increasing difficulty
 -boss battles? multiple kinds of enemies?
 -high score?
*/

//-----------------------------------------------------------------------------

//var game = new Phaser.Game(848, 450, Phaser.AUTO, 'game');
var game = new Phaser.Game(960, 650, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
