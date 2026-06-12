class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");
    this.threshold = 0.1;
    this.speed = 100;
    this.direction = undefined;
    this.remotePlayers = [];

    this.monsterPositions = [600, 1100, 1600, 2100, 2600, 3100, 3600, 4100, 4600, 5100, 5600];
    this.currentMonsterIndex = 0; // Começa no primeiro da lista
  }

  create() {
    this.map = this.make.tilemap({ key: "mars" });
    this.tilesetmars = this.map.addTilesetImage("marte");

    this.layerceu = this.map.createLayer("ceu", [this.tilesetmars]);
    this.layersol = this.map.createLayer("sol", [this.tilesetmars]);
    this.layerf4 = this.map.createLayer("f4", [this.tilesetmars]);
    this.layerf2 = this.map.createLayer("f2", [this.tilesetmars]);
    this.layerf1 = this.map.createLayer("f1", [this.tilesetmars]);
    this.layerf5 = this.map.createLayer("f5", [this.tilesetmars]);
    this.layertub1 = this.map.createLayer("tub1", [this.tilesetmars]);
    this.layertub2 = this.map.createLayer("tub2", [this.tilesetmars]);
    this.layerchao = this.map.createLayer("chao", [this.tilesetmars]);
    this.layerplatf = this.map.createLayer("platf", [this.tilesetmars]);
    this.layersub1 = this.map.createLayer("sub1", [this.tilesetmars]);
    this.layersub2 = this.map.createLayer("sub2", [this.tilesetmars]);

    // Utilitário: retorna o Y (pixel) do topo do tile de chão mais acima no X fornecido
    const findGroundY = (x, layer) => {
      for (
        let yy = 0;
        yy < this.map.heightInPixels;
        yy += this.map.tileHeight
      ) {
        const tile = layer.getTileAtWorldXY(x, yy, true);
        if (tile && tile.properties && tile.properties.collides)
          return tile.pixelY;
      }
      return this.map.heightInPixels - 100;
    };

    // Animações do Monstro
    this.anims.create({
      key: "monster-standing-still",
      frames: this.anims.generateFrameNumbers("monster", { start: 0, end: 1 }),
      frameRate: 5,
      repeat: -1,
    });


    this.anims.create({
      key: "monster-running-left",
      frames: this.anims.generateFrameNumbers("monster", { start: 2, end: 9 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "monster-standing-right",
      frames: this.anims.generateFrameNumbers("monster", { start: 10, end: 10 }),
      frameRate: 5,
      repeat: -1,
    });


    this.anims.create({
      key: "monster-standing-right",
      frames: this.anims.generateFrameNumbers("monster", {
        start: 12,
        end: 19,
      }),
      frameRate: 5,
      repeat: -1,
    });
    // Criando o astronauta (posicionado diretamente sobre o chão)
    this.astronauta = this.physics.add.sprite(150, 0, "astronauta", 0);
    this.astronauta.setSize(32, 48);
    if (this.astronauta.body) this.astronauta.body.allowGravity = false;
    const astronautaGroundY = findGroundY(150, this.layerchao);
    this.astronauta.setPosition(
      150,
      astronautaGroundY - this.astronauta.displayHeight / 2,
    );
    if (this.astronauta.body) {
      this.astronauta.body.allowGravity = true;
      this.astronauta.setVelocityY(0);
    }
    this.monsters = this.physics.add.group();

    // Lista de posições: O primeiro vai surgir bem mais para a frente (X: 1200 - metade do mapa)
    this.monsterPositions = [1200, 1700, 2200, 3000, 4000, 5000, 5050, 5100, 5150, 5200, 5250, 5300, 5350, 5400, 5450, 5500, 5550, 5600, 5650, 5700, 5750, 5800, 5850];
    this.currentMonsterIndex = 0;
    this.firstMonsterSpawned = false;

    // Função para criar o próximo monstro da lista
    this.spawnNextMonster = () => {
      if (this.currentMonsterIndex < this.monsterPositions.length) {
        let spawnX = this.monsterPositions[this.currentMonsterIndex];
        // Calcula Y do chão no X de spawn (usa utilitário findGroundY)
        // Cria o monstro sem gravidade, posiciona sobre o chão e reativa gravidade
        let newMonster = this.monsters.create(spawnX, 0, "monster", 0);
        newMonster.setSize(32, 48);
        newMonster.setCollideWorldBounds(true);
        newMonster.anims.play("monster-standing-still", true);
        newMonster.speed = 50; // Velocidade ajustada que você gostou

        if (newMonster.body) newMonster.body.allowGravity = false;
        const groundY = findGroundY(spawnX, this.layerchao);
        newMonster.setPosition(spawnX, groundY - newMonster.displayHeight / 2);
        if (newMonster.body) {
          newMonster.body.allowGravity = true;
          newMonster.setVelocityY(0);
        }

        this.currentMonsterIndex++;
      }
    };

    // --- ADICIONE OS COLISORES DO GRUPO COM O CENÁRIO ---
    this.physics.add.collider(this.monsters, this.layerceu);
    this.physics.add.collider(this.monsters, this.layertub1);
    this.physics.add.collider(this.monsters, this.layertub2);
    this.physics.add.collider(this.monsters, this.layerchao);
    this.physics.add.collider(this.monsters, this.layerplatf);

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

    // Animações do Astronauta
    this.anims.create({
      key: "standing-still",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 0,
        end: 2,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "running-right",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 3,
        end: 12,
      }),
      frameRate: 10,
      repeat: -1,
    });


    this.anims.create({
      key: "standing-still",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: "running-left",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 33,
        end: 42,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jumping-right",
      frames: this.anims.generateFrameNumbers("astronauta", {
        start: 13,
        end: 22,
      }),
      frameRate: 10,
      repeat: -1,
    });

     this.anims.create({
       key: "jumping-left",
       frames: this.anims.generateFrameNumbers("astronauta", {
         start: 23,
         end: 31,
       }),
       frameRate: 10,
       repeat: -1,
     });


    // Configurações do Mundo e Câmera
    this.physics.world.setBounds(
      0,
      0,
      this.tilesetmars.widthInPixels,
      this.tilesetmars.heightInPixels,
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.tilesetmars.widthInPixels,
      this.tilesetmars.heightInPixels,
    );
    this.cameras.main.startFollow(this.astronauta);

    this.astronauta.setCollideWorldBounds(true);

    this.layerceu.setCollisionByProperty({ collides: true });
    this.layertub1.setCollisionByProperty({ collides: true });
    this.layertub2.setCollisionByProperty({ collides: true });
    this.layerchao.setCollisionByProperty({ collides: true });
    this.layerplatf.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.astronauta, this.layerceu);
    this.physics.add.collider(this.astronauta, this.layertub1);
    this.physics.add.collider(this.astronauta, this.layertub2);
    this.physics.add.collider(this.astronauta, this.layerchao);
    this.physics.add.collider(this.astronauta, this.layerplatf);

    this.physics.add.collider(this.monsters, this.layerceu);
    this.physics.add.collider(this.monsters, this.layertub1);
    this.physics.add.collider(this.monsters, this.layertub2);
    this.physics.add.collider(this.monsters, this.layerchao);
    this.physics.add.collider(this.monsters, this.layerplatf);

    this.layerplatf.forEachTile((tile) => {
      if (tile.properties.collides) {
        tile.setCollision(false, false, true, false);
      }
    });
   
    this.pontos = 0;
    
    this.iconeMoeda = this.add.image(45, 35, "coin");
    this.iconeMoeda.setScale(1.2);
    this.iconeMoeda.setScrollFactor(0);
    this.iconeMoeda.setDepth(2000);

    // Texto mostrando a quantidade de moedas
    this.textoPontos = this.add.text(100, 22, "0", {
      fontSize: "36px",
      fill: "#ffffff",
      fontFamily: "Arial",
    });
    this.textoPontos.setScrollFactor(0);
    this.textoPontos.setDepth(2000);
    
    this.coins = this.physics.add.staticGroup();
this.coins.create(300, 500, "coin");
this.coins.create(450, 460, "coin");
this.coins.create(600, 450, "coin");
this.coins.create(750, 460, "coin");
this.coins.create(900, 500, "coin");

// Parte inicial
this.coins.create(1100, 480, "coin");
this.coins.create(1300, 420, "coin");
this.coins.create(1500, 420, "coin");
this.coins.create(1700, 500, "coin");
this.coins.create(1900, 460, "coin");

// Meio da fase
this.coins.create(2100, 480, "coin");
this.coins.create(2200, 450, "coin");
this.coins.create(2400, 420, "coin");
this.coins.create(2600, 450, "coin");
this.coins.create(2800, 500, "coin");
this.coins.create(3000, 480, "coin");

// Depois do meio
this.coins.create(3200, 430, "coin");
this.coins.create(3400, 400, "coin");
this.coins.create(3600, 430, "coin");
this.coins.create(3800, 480, "coin");
this.coins.create(4000, 500, "coin");

// Parte avançada
this.coins.create(4200, 460, "coin");
this.coins.create(4400, 420, "coin");
this.coins.create(4600, 420, "coin");
this.coins.create(4800, 460, "coin");
this.coins.create(5000, 500, "coin");

// Perto do final
this.coins.create(5150, 500, "coin");
this.coins.create(5300, 470, "coin");
this.coins.create(5450, 440, "coin");
this.coins.create(5600, 400, "coin");
this.coins.create(5750, 440, "coin");
this.coins.create(5900, 470, "coin");
this.coins.create(6000, 500, "coin");
    this.coins.children.iterate((coin) => {
      coin.setScale(0.5);
      coin.refreshBody();
       coin.setDepth(1000);
    });

    this.physics.add.overlap(
      this.astronauta,
      this.coins,
      this.pegarMoeda,
      null,
      this,
    );
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

    this.vidaMaxima = 4;
    this.vidaAtual = 4;
    this.podeTomarDano = true;

    this.hudVida = this.add.image(100, 80, "vida_cheia"); // <-- Faltou o ponto e vírgula ";"
    this.hudVida.setScrollFactor(0); // <--- O ERRO ESTÁ AQUI!
    this.hudVida.setDepth(2000);
    this.hudVida.setScale(1.5);

    this.game.socket.on("scene0", (state) => {
      if (state.astronauta) {
        try {
          if (state.astronauta.id === this.game.socket.id) return;

          let remotePlayer = this.remotePlayers.find(
            (p) => p.id === state.astronauta.id,
          );

          if (!remotePlayer) {
            let remoteSprite = this.add.sprite(
              state.astronauta.x,
              state.astronauta.y,
              "alien",
              0,
            );
            remotePlayer = {
              id: state.astronauta.id,
              sprite: remoteSprite,
            };
            this.remotePlayers.push(remotePlayer);
          }

          // Só altera a posição se o sprite realmente existir na tela
          if (remotePlayer && remotePlayer.sprite) {
            remotePlayer.sprite.setPosition(
              state.astronauta.x,
              state.astronauta.y,
            );
            remotePlayer.sprite.setTexture(
              state.astronauta.texture,
              state.astronauta.frame,
            );
          }
        } catch (e) {
          console.log(this.remotePlayers);
          console.error("Error updating remote player:", e);
        }
      }
    });
  } // Fim do método create()

  update() {
    // Animação padrão de parado do astronauta
    if (
      this.astronauta.body.velocity.x === 0 &&
      this.astronauta.body.velocity.y === 0 &&
      (this.astronauta.body.blocked.down || this.astronauta.body.blocked.up)
    )
      this.astronauta.anims.play("standing-still", true);

    // Morte por queda em buraco
    if (this.astronauta && this.astronauta.y > 760) {
      this.astronauta.setTint(0xff0000);
      this.physics.pause();

      if (this.music) this.sound.stopAll();

      console.log("O astronauta caiu no buraco!");

      this.time.delayedCall(
        1000,
        () => {
          this.scene.start("GameOver");
        },
        [],
        this,
      );

      return;
    }

    if (
      this.astronauta &&
      this.astronauta.x > 700 &&
      !this.firstMonsterSpawned
    ) {
      this.firstMonsterSpawned = true;
      this.spawnNextMonster();
      console.log(
        "Gatilho ativado! Primeiro monstro apareceu na metade do caminho.",
      );
    }

    if (this.monsters && this.monsters.getLength() > 0) {
      this.monsters.children.iterate((monster) => {
        if (monster && this.astronauta) {
          // Inteligência de seguir o astronauta
          if (this.astronauta.x > monster.x + 10) {
            monster.setVelocityX(monster.speed);
            monster.flipX = false;
          } else if (this.astronauta.x < monster.x - 10) {
            monster.setVelocityX(-monster.speed);
            monster.flipX = true;
          } else {
            monster.setVelocityX(0);
          }

          // Inteligência de pular paredes/obstáculos
          if (
            (monster.body.blocked.left || monster.body.blocked.right) &&
            monster.body.blocked.down
          ) {
            monster.setVelocityY(-150);
          }
        }
      });
    }

    // Enviar atualização do jogador local para o socket
    try {
      this.game.socket.emit("scene0", this.game.room, {
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

    const larguraRealDoMundo = this.physics.world.bounds.width;
    if (this.astronauta && this.astronauta.x >= 6600) {
      this.astronauta.setVelocity(0, 0);
      if (this.astronauta.body) {
        this.astronauta.body.allowGravity = false; // Desliga a gravidade temporariamente
      }

      //if (this.music) this.sound.stopAll(); // Para a música da Fase 0
     // console.log("Astronauta chegou ao fim! Mudando para a scene1...");//
      //try {
       // this.game.socket.emit("scene0", this.game.room, {
          //changeScene: "scene1",
       // });//
     // } catch (e) {
     //   console.error("Erro ao emitir mudança de cena pelo socket:", e);
      }

     // this.scene.stop("scene0");
     // this.scene.start("scene1");
     // return;
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

  levarDano() {
    // Se o jogador acabou de tomar dano e está piscando, ignora novos golpes
    if (!this.podeTomarDano) return;

    this.vidaAtual--;
    this.podeTomarDano = false;

    // Deixa o astronauta vermelho temporariamente
    this.astronauta.setTint(0xff0000);

    // Atualiza qual imagem de coração vai aparecer na tela (Baseado em 4 vidas)
    if (this.vidaAtual === 3 || this.vidaAtual === 2) {
      this.hudVida.setTexture("vida_media"); // Mostra h11.png (metade)
    } else if (this.vidaAtual === 1) {
      this.hudVida.setTexture("vida_baixa"); // Mostra h1.png (1 coração)
    }

    // Se as vidas acabarem, aí sim dá Game Over
    if (this.vidaAtual <= 0) {
      this.physics.pause();
      if (this.music) this.sound.stopAll();
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
      // Se ainda tem vida, espera 1 segundo (piscando), limpa a cor e permite tomar dano de novo
      this.time.delayedCall(
        1000,
        () => {
          if (this.astronauta) {
            this.astronauta.clearTint();
          }
          this.podeTomarDano = true;
        },
        [],
        this,
      );
    }
  }

  pegarMoeda(astronauta, coin) {
    coin.destroy();

    this.pontos = this.pontos + 1;

    this.textoPontos.setText("x " + this.pontos);

    console.log("Pegou uma moeda! Total:", this.pontos);
  }
}

export default scene0;
