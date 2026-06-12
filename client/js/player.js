class player extends Phaser.Scene {
  constructor() {
    super("player");
  }

  create() {
    this.add.image(400, 225, "start-scene").postFX.addBlur(5);

    this.add
      .text(400, 50, "Escolha seu personagem:", {
        fontFamily: "pixelify-sans",
        fontSize: "64px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.anims.create({
      key: "astronauta",
      frames: this.anims.generateFrameNumbers("astronauta", { start: 3, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "astronauta",
      frames: this.anims.generateFrameNumbers("alien", {start: 3, end: 8, }),
      frameRate: 10,
      repeat: -1,
    });

    this.astronauta = this.add
      .sprite(300, 225, "astronauta")
      .setScale(3)
      .setInteractive()
      .on("pointerdown", () => {
        console.log("astronauta player selected");
        this.game.localPlayer = "astronauta";
        this.game.socket.emit(
          "select-player",
          this.game.room,
          this.game.localPlayer,
        );
        this.scene.stop("astronauta");
        this.scene.start("scene0");
      });
    this.astronauta.play("astronauta");

    this.astronauta = this.add
      .sprite(550, 225, "astronauta")
      .setScale(3)
      .setInteractive()
      .on("pointerdown", () => {
        console.log("astronauta player selected");
        this.game.localPlayer = "astronauta";
        this.game.socket.emit(
          "select-player",
          this.game.room,
          this.game.localPlayer,
        );
        this.scene.stop("player");
        this.scene.start("scene0");
      });
    this.astronauta.play("astronauta");
  }
}

export default player;