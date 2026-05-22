class start extends Phaser.Scene {
  constructor() {
    super("start");
  }

  init() {
    let room = new URLSearchParams(location.search).get("room");
    if (room) {
      this.game.room = room;
      this.game.socket.emit("join-room", this.game.room);
    }
  }

  preload() {
    this.load.setPath("assets/");
    this.load.image("start", "start-scene.png");
  }

  create() {
    const bg = this.add.image(400, 225, "start");
    const scaleX = this.sys.game.config.width / bg.width;
    const scaleY = this.sys.game.config.height / bg.height;
    const scale = Math.max(scaleX, scaleY);

    bg.setScale(scale);
    bg.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

    bg.setInteractive().on("pointerdown", () => {
      this.scene.start("preloader");
    });
  }
}

export default start;
