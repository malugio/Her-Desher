class preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  init() {
    this.add.image(400, 225, "start-scene").postFX.addBlur(5);

    this.add.rectangle(400, 300, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(400 - 230, 300, 4, 28, 0xffffff);

    this.load.on("progress", (progress) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets/");

    this.load.image("room-background", "room-background.png");

    this.load.tilemapTiledJSON("mars", "mars.json");
    this.load.tilemapTiledJSON("nave", "nave.json");
    this.load.spritesheet("astronauta", "astronauta.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("astronauta", "astronauta.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet("alien", "alien.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet("monster", "monster.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.image("marte", "mars-tileset.png");
    this.load.image("level_tileset", "level_tileset.png");

    this.load.spritesheet("buttons", "buttons.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.audio("music", "music.mp3");
    this.load.audio("efeito", "efeito.mp3");
    this.load.audio("coin", "coin.mp3");

    this.load.plugin(
      "rexvirtualjoystickplugin",
      "../js/rexvirtualjoystickplugin.min.js",
      true,
    );
  }

  create() {
    this.scene.stop("preloader");
    if (this.game.room) {
      this.scene.start("player");
    } else {
      this.scene.start("room");
    }
  }
}

export default preloader;
