class scene1 extends Phaser.Scene {
  constructor() {
    super("scene1");

    this.threshold = 0.1;
    this.speed = 100;
    this.direction = undefined;
    this.remotePlayers = [];
    this.levelComplete = false;
    this.lastSocketEmit = 0;
  }

  create() {
    this.map = this.make.tilemap({ key: "nave" });

    this.tilesetLevel = this.map.addTilesetImage(
      "level_tileset",
      "level_tileset",
    );

    // --- 1. CRIAÇÃO DAS CAMADAS ---
    this.layerFundo = this.map.createLayer("fundo", [this.tilesetLevel]);
    this.layerTrap = this.map.createLayer("trap", [this.tilesetLevel]);
    this.layerArmadilha = this.map.createLayer("armadilha", [
      this.tilesetLevel,
    ]);
    this.layerPlataforma = this.map.createLayer("plataforma", [
      this.tilesetLevel,
    ]);

    const findGroundY = (x, layer) => {
      for (
        let yy = 0;
        yy < this.map.heightInPixels;
        yy += this.map.tileHeight
      ) {
        const tile = layer.getTileAtWorldXY(x, yy, true);

        if (tile && tile.properties && tile.properties.collides) {
          const tileAbove = layer.getTileAtWorldXY(
            x,
            yy - this.map.tileHeight,
            true,
          );
          const aboveEmpty =
            !tileAbove ||
            !tileAbove.properties ||
            !tileAbove.properties.collides;

          if (aboveEmpty && yy > 0) {
            return tile.pixelY;
          }
        }
      }
      return this.map.heightInPixels - 100;
    };

    const createAnimationOnce = (config) => {
      if (!this.anims.exists(config.key)) {
        this.anims.create(config);
      }
    };

    createAnimationOnce({
      key: "monster-standing-still",
      frames: this.anims.generateFrameNumbers("monster", {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    createAnimationOnce({
      key: "standing-still",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    createAnimationOnce({
      key: "running-right",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 19,
        end: 26,
      }),
      frameRate: 10,
      repeat: -1,
    });

    createAnimationOnce({
      key: "running-left",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 11,
        end: 19,
      }),
      frameRate: 10,
      repeat: -1,
    });

    createAnimationOnce({
      key: "jumping",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 3,
        end: 10,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Criando o astronauta posicionado diretamente sobre o chão real do corredor
    this.astronauta = this.physics.add.sprite(150, 0, "astronauta", 0);
    this.astronauta.setSize(32, 48);
    if (this.astronauta.body) this.astronauta.body.allowGravity = false;
    const astronautaGroundY = findGroundY(150, this.layerPlataforma);
    this.astronauta.setPosition(
      150,
      astronautaGroundY - this.astronauta.displayHeight / 2,
    );
    if (this.astronauta.body) {
      this.astronauta.body.allowGravity = true;
      this.astronauta.setVelocityY(0);
    }

    // Grupo de monstros e posições
    this.monsters = this.physics.add.group();
    this.monsterPositions = [800, 1200, 1600];
    this.currentMonsterIndex = 0;
    this.firstMonsterSpawned = false;

    // Vida/HUD
    this.vidaMaxima = 4;
    this.vidaAtual = 4;
    this.podeTomarDano = true;
    this.hudVida = this.add.image(100, 80, "vida_cheia");
    this.hudVida.setScrollFactor(0);
    this.hudVida.setDepth(2000);
    this.hudVida.setScale(1.5);

    // Função para criar o próximo monstro da lista usando a nova detecção de chão
    this.spawnNextMonster = () => {
      if (this.currentMonsterIndex < this.monsterPositions.length) {
        const spawnX = this.monsterPositions[this.currentMonsterIndex];
        let newMonster = this.monsters.create(spawnX, 0, "monster", 0);
        newMonster.setSize(32, 48);
        newMonster.setCollideWorldBounds(true);
        newMonster.anims.play("monster-standing-still", true);
        newMonster.speed = 50;

        if (newMonster.body) newMonster.body.allowGravity = false;
        const groundY = findGroundY(spawnX, this.layerPlataforma);
        newMonster.setPosition(spawnX, groundY - newMonster.displayHeight / 2);
        if (newMonster.body) {
          newMonster.body.allowGravity = true;
          newMonster.setVelocityY(0);
        }

        this.currentMonsterIndex++;
      }
    };

    // As animações já foram criadas acima em createAnimationOnce.
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

    // --- CONFIGURAÇÃO DE COLISÕES E OVERLAPS DAS ARMADILHAS ---
    this.layerTrap.setCollisionByExclusion([-1]);
    this.layerArmadilha.setCollisionByExclusion([-1]);

    this.physics.add.overlap(
      this.astronauta,
      this.layerTrap,
      this.astronautaMorreu,
      null,
      this,
    );
    this.physics.add.overlap(
      this.astronauta,
      this.layerArmadilha,
      this.astronautaMorreu,
      null,
      this,
    );

    this.layerPlataforma.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.astronauta, this.layerPlataforma);
    this.physics.add.collider(this.monsters, this.layerPlataforma);

    this.physics.add.collider(
      this.astronauta,
      this.monsters,
      (astronauta, monster) => {
        if (astronauta.body.touching.down && monster.body.touching.up) {
          monster.destroy();
          astronauta.setVelocityY(-150);
          this.spawnNextMonster();
        } else {
          this.levarDano();
        }
      },
      null,
      this,
    );

    this.music = this.sound.add("music", { loop: true });
    this.music.play();

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

    if (this.game.socket) {
      this.game.socket.off("scene1");
      this.game.socket.on("scene1", (state) => {
        if (state.astronauta && state.astronauta.id !== this.game.socket.id) {
          try {
            let remotePlayer = this.remotePlayers.find(
              (p) => p.id === state.astronauta.id,
            );

            if (!remotePlayer) {
              const sprite = this.add.sprite(
                state.astronauta.x,
                state.astronauta.y,
                "alien",
                0,
              );
              remotePlayer = { id: state.astronauta.id, sprite };
              this.remotePlayers.push(remotePlayer);
            }

            if (remotePlayer.sprite) {
              remotePlayer.sprite.setPosition(
                state.astronauta.x,
                state.astronauta.y,
              );
              remotePlayer.sprite.setTexture(
                state.astronauta.texture || "alien",
                typeof state.astronauta.frame === "number"
                  ? state.astronauta.frame
                  : 0,
              );
            }
          } catch (e) {
            console.error("Error updating remote player:", e);
          }
        }
      });
    }
  }

  update(time) {
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

      this.time.delayedCall(
        1000,
        () => {
          this.scene.stop();
          this.scene.start("final-feliz");
        },
        [],
        this,
      );

      return;
    }

    if (this.game.socket && time - this.lastSocketEmit >= 100) {
      this.lastSocketEmit = time;
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
            frame: this.astronauta.anims.currentFrame
              ? this.astronauta.anims.currentFrame.index
              : 0,
          },
        });
      } catch (e) {
        console.error("Error updating astronauta:", e);
      }
    }

    if (
      this.astronauta &&
      this.astronauta.x > 800 &&
      !this.firstMonsterSpawned
    ) {
      this.firstMonsterSpawned = true;
      this.spawnNextMonster();
    }

    if (
      this.firstMonsterSpawned &&
      this.monsters &&
      this.monsters.getLength() === 0 &&
      this.currentMonsterIndex < this.monsterPositions.length
    ) {
      this.spawnNextMonster();
    }

    if (this.monsters && this.monsters.getLength() > 0) {
      this.monsters.children.iterate((monster) => {
        if (monster && this.astronauta) {
          if (this.astronauta.x > monster.x + 10) {
            monster.setVelocityX(monster.speed);
            monster.flipX = false;
          } else if (this.astronauta.x < monster.x - 10) {
            monster.setVelocityX(-monster.speed);
            monster.flipX = true;
          } else {
            monster.setVelocityX(0);
          }

          if (
            (monster.body.blocked.left || monster.body.blocked.right) &&
            monster.body.blocked.down
          ) {
            monster.setVelocityY(-150);
          }
        }
      });
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

  astronautaMorreu(astronauta, tile) {
    astronauta.setVelocity(0, 0);
    astronauta.body.enable = false;
    astronauta.setTint(0xff0000);

    console.log("Astronauta atingiu uma armadilha e morreu!");

    this.music?.stop();
    this.scene.restart();
  }

  levarDano() {
    if (!this.podeTomarDano) return;

    this.vidaAtual--;
    this.podeTomarDano = false;

    if (this.astronauta) this.astronauta.setTint(0xff0000);

    if (this.vidaAtual === 3 || this.vidaAtual === 2) {
      this.hudVida.setTexture("vida_media");
    } else if (this.vidaAtual === 1) {
      this.hudVida.setTexture("vida_baixa");
    }

    if (this.vidaAtual <= 0) {
      this.physics.pause();
      if (this.music) this.music.stop();
      console.log("O astronauta ficou sem vidas!");

      this.time.delayedCall(
        1000,
        () => {
          this.scene.start("GameOver");
        },
        [],
        this,
      );
    } else {
      this.time.delayedCall(
        1000,
        () => {
          if (this.astronauta) this.astronauta.clearTint();
          this.podeTomarDano = true;
        },
        [],
        this,
      );
    }
  }
}

export default scene1;
