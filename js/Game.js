class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leadeboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playermoving = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

    start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    powerCoins = new Group();

    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
  }

  
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    //form.titleImg.position(40, 50);
    //form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 350, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 400, 10);
    
    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);
    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);
    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);

  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getcarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          
          // Changing camera position in y direction
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;

        }
      }

      //giving AI to the car movement
      if (this.playermoving && player.positionY < finishline)
      {
        player.positionY += 10;
        player.update();
      }


      // handling keyboard events
    if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
              player.update();
      } 
      this.handlePlayerControls();

      const finishline= height*6 - 200;
      if (players.positionY > finishline) {
        gameState = 2;
        player.rank += 1;
        Player.updatecarsAtEnd(player.rank);
        player.update();
        this.showrank(); 
        this.gameOver();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel = 185;
      if (this.playermoving && player.fuel >0)
      {
        player.fuel -= 1;

      }
      if (player.fuel <= 0)
      {
        gameState = 2;
        gameOver();
      }
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }

  showFuel ()
  {
    push ();
    image (fuelImage, width / 2 - 100, 50);
    fill("white");
    rect (width/2 + 120, 50, 80, 20);
    fill ("green");
    rect (width/2 + 120, 50, player.fuel, 20);    
    pop ();
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 21;
      player.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }

  showLife()
  {
    push ();
    image (Lifeimage, width / 2 - 100, 15);
    fill("white");
    rect (width/2 + 120, 20, 80, 15);
    fill ("red");
    rect (width/2 +120, 20, player.life, 15);    
    pop ();
  }

handleResetButton() {
  this.resetButton.mousePressed(() => {
    database.ref("/").set({
      playerCount: 0,
      gameState: 0,
      carsAtEnd: 0,
      players: {}
    });
    window.location.reload();
  });
}
showLeaderboard() {
  var leader1, leader2;
  var players = Object.values(allPlayers);
  if (
    (players[0].rank === 0 && players[1].rank === 0) ||
    players[0].rank === 1
  ) {
    // &emsp;    This tag is used for displaying four spaces.
    leader1 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;
    leader2 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;
  }
  if (players[1].rank === 1) {
    leader1 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;
    leader2 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;
  }
  this.leader1.html(leader1);
  this.leader2.html(leader2);
}
handlePlayerControls() 
{
  if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
    player.positionX -= 5;
    player.update();
  }

  if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 150) {
    player.positionX += 5;
    player.update();
  }

}
  showrank() {
    swal ({
      title:"CONGRATULATIONS!!${\n}Rank${\n}${player.rank}",
      text:"You have reached the finish line successfully!",
      imageUrl:"https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize:"50,50",
      confirmButtonText:"OK"
    })    
   }
gameOver()
 {
  swal ({
    title:"GAME OVER!!",
      text:"Hope you enjoyed the game!!",
      imageUrl:"https://www.cleanpng.com/png-racing-games-free-car-racing-video-game-computer-i-826199/",
      imageSize:"50,50",
      confirmButtonText:"PLAY AGAIN"
  })
 }
} 
  