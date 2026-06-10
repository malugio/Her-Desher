class scene1 extends Phaser.Scene {
  constructor() {
    super("scene1");

    this.threshold = 0.1;
    this.speed = 100;
    this.direction = undefined;
    this.remotePlayers = [];
    this.levelComplete = false;
  }

  create() {
    this.map = this.make.tilemap({ key: "nave" });

    this.tilesetLevel = this.map.addTilesetImage(
      "level_tileset",
      "level_tileset",
    );

    this.layerFundo = this.map.createLayer("fundo", [this.tilesetLevel]);
    this.layerTrap = this.map.createLayer("trap", [this.tilesetLevel]);
    this.layerPlataforma = this.map.createLayer("plataforma", [
      this.tilesetLevel,
    ]);

    this.anims.create({
      key: "monster-standing-still",
      frames: this.anims.generateFrameNumbers("monster", {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.astronauta = this.physics.add.sprite(150, 0, "astronauta", 0);
    this.astronauta.setSize(32, 48);

    this.anims.create({
      key: "standing-still",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "running-right",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 19,
        end: 26,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "running-left",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 11,
        end: 19,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jumping",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 3,
        end: 10,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.cameras.main.startFollow(this.astronauta);

    this.astronauta.setCollideWorldBounds(true);

    this.layerTrap.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.astronauta, this.layerTrap);

    this.layerPlataforma.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.astronauta, this.layerPlataforma);

    this.music = this.sound.add("music", { loop: true }).play();

    this.joystick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
      x: 80,
      y: 360,
      radius: 50,
      base: this.add.circle(0, 0, 40, 0xcccccc),
      thumb: this.add.circle(0, 0, 20, 0x666666),
    });

    this.joystick.on("update", () => {
      const angle = Phaser.Math.DegToRad(this.joystick.angle);
      const force = this.joystick.force;

      if (force > this.threshold)
        this.direction = new Phaser.Math.Vector2(
          Math.cos(angle),
          Math.sin(angle),
        ).normalize();

      if (this.joystick.force > 0)
        switch (true) {
          case this.joystick.angle >= -20 && this.joystick.angle < 20:
            this.astronauta.flipX = false;
            this.astronauta.setVelocityX(200);

            if (
              this.astronauta.body.blocked.down ||
              this.astronauta.body.blocked.up
            ) {
              this.astronauta.anims.play("running-right", true);
            }
            break;
          case this.joystick.angle >= 160 || this.joystick.angle < -160:
            this.astronauta.flipX = true;
            this.astronauta.setVelocityX(-200);

            if (
              this.astronauta.body.blocked.down ||
              this.astronauta.body.blocked.up
            ) {
              this.astronauta.anims.play("running-left", true);
            }
            break;
        }
      else this.astronauta.setVelocityX(0);
    });

    this.jumpButton = this.add
      .sprite(750, 400, "buttons", 8)
      .setInteractive()
      .on("pointerdown", () => {
        this.jumpButton.setFrame(9);
        this.jump(this.astronauta, this.physics.world.gravity.y);
      })
      .on("pointerup", () => {
        this.jumpButton.setFrame(8);
      })
      .setScrollFactor(0);

    this.game.socket.on("scene1", (state) => {
      if (state.astronauta) {
        try {
          if (state.astronauta.id === this.game.socket.id) return;

          let remotePlayer = this.remotePlayers.find(
            (p) => p.id === state.astronauta.id,
          );

          if (!remotePlayer) {
            let sprite = this.add.sprite(
              state.astronauta.x,
              state.astronauta.y,
              "alien",
              0,
            );
            this.remotePlayers.push({
              id: state.astronauta.id,
              sprite: sprite,
            });

            remotePlayer = this.remotePlayers.find(
              (p) => p.id === state.astronauta.id,
            );
          }

          remotePlayer.sprite.setPosition(
            state.astronauta.x,
            state.astronauta.y,
          );

          remotePlayer.sprite.setTexture(
            state.astronauta.texture,
            state.astronauta.frame,
          );
        } catch (e) {
          console.log(this.remotePlayers);
          console.error("Error updating remote player:", e);
        }
      }
    });
  }

  update() {
    if (
      this.astronauta.body.velocity.x === 0 &&
      this.astronauta.body.velocity.y === 0 &&
      (this.astronauta.body.blocked.down || this.astronauta.body.blocked.up)
    )
      this.astronauta.anims.play("standing-still", true);

    if (
      !this.levelComplete &&
      this.astronauta.x >= this.map.widthInPixels - 32 &&
      (this.astronauta.body.blocked.down || this.astronauta.body.blocked.up)
    ) {
      this.levelComplete = true;
      this.music?.stop();
      this.add.text(
        this.cameras.main.scrollX + 260,
        this.cameras.main.scrollY + 200,
        "Fase 2 concluída!",
        {
          fontFamily: "pixelify-sans",
          fontSize: "32px",
          fill: "#ffffff",
        },
      );
      return;
    }

    try {
      this.game.socket.emit("scene1", this.game.room, {
        astronauta: {
          id: this.game.socket.id,
          x: this.astronauta.x,
          y: this.astronauta.y,
          texture: "astronauta",
          animation: this.astronauta.anims.currentAnim
            ? this.astronauta.anims.currentAnim.key
            : "standing-still",
          frame: this.astronauta.anims.currentFrame.index,
        },
      });
    } catch (e) {
      console.error("Error updating astronauta:", e);
    }
  }

  jump(astronauta, gravity) {
    if (gravity > 0)
      if (astronauta.body.blocked.down) {
        astronauta.setVelocityY(-150);
        astronauta.anims.play("jumping", true);
      } else if (astronauta.body.blocked.up) {
        astronauta.setVelocityY(150);
        astronauta.anims.play("jumping", true);
      }
  }
}

export default scene1;
