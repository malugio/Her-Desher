class scene1 extends Phaser.Scene {
  constructor() {
    super("scene1"); // O RG ou nome dessa nova cena
    this.threshold = 0.1;
    this.speed = 100;
    this.direction = undefined;
    this.remotePlayers = [];

    // Resetando os monstros para a nova fase
    this.monsterPositions = [1200, 1800, 2400, 3200, 4200];
    this.currentMonsterIndex = 0;
  }

  create() {
    // Montando o mapa da fase final
    this.map = this.make.tilemap({ key: "fasefinal" });

    // Linkando as imagens carregadas com os nomes de dentro do Tiled
    this.tcave = this.map.addTilesetImage("tilesetcave");
    this.tvine2 = this.map.addTilesetImage("Tileset_Vine_2");
    this.bgvine4 = this.map.addTilesetImage("Background_Vine_4");

    // Juntamos todos os tilesets em uma lista para as camadas usarem
    const todosTilesets = [this.tcave, this.tvine2, this.bgvine4];

    // CÓDIGO NOVO: Criando as camadas na ordem certa (do fundo para a frente)
this.layerSky = this.map.createLayer("sky", todosTilesets);
this.layerSun = this.map.createLayer("sun", todosTilesets);

// Montanhas de fundo
this.layerM4 = this.map.createLayer("m4", todosTilesets);
this.layerM3 = this.map.createLayer("m3", todosTilesets);
this.layerM2 = this.map.createLayer("m2", todosTilesets);
this.layerM1a = this.map.createLayer("m1a", todosTilesets);
this.layerFunPedras = this.map.createLayer("funpedras", todosTilesets);

// O CHÃO PRINCIPAL (Onde o astronauta anda)
this.layerChao = this.map.createLayer("ground", todosTilesets); 

// As pedras e armadilhas superiores
this.layerRockB1 = this.map.createLayer("rockb1", todosTilesets);
this.layerRockB2 = this.map.createLayer("rockb2", todosTilesets);
this.layerTrap1 = this.map.createLayer("pedratrap1", todosTilesets);
this.layerTrap2 = this.map.createLayer("pedratrap2", todosTilesets);
    // Utilitário: retorna o Y (pixel) do topo do tile de chão mais acima no X fornecido
    const findGroundY = (x, layer) => {
      if (!layer) return this.map.heightInPixels - 100;
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
      frames: this.anims.generateFrameNumbers("monster", { start: 0, end: 0 }),
      frameRate: 5,
      repeat: -1,
    });

    // Criando o nosso Herói Astronauta
    this.astronauta = this.physics.add.sprite(150, 0, "astronauta", 0);
    this.astronauta.setSize(32, 48);
    this.astronauta.setCollideWorldBounds(true);

    // Posicionando o Astronauta no chão correto da camada de chão
    if (this.astronauta.body) this.astronauta.body.allowGravity = false;
    const astronautaGroundY = findGroundY(150, this.layerChao);
    this.astronauta.setPosition(
      150,
      astronautaGroundY - this.astronauta.displayHeight / 2,
    );
    if (this.astronauta.body) {
      this.astronauta.body.allowGravity = true;
      this.astronauta.setVelocityY(0);
    }

    // Grupo de monstros
    this.monsters = this.physics.add.group();
    this.firstMonsterSpawned = false;

    // Função para criar monstros dinamicamente (Padronizada com a scene0)
    this.spawnNextMonster = () => {
      if (this.currentMonsterIndex < this.monsterPositions.length) {
        let spawnX = this.monsterPositions[this.currentMonsterIndex];
        let newMonster = this.monsters.create(spawnX, 0, "monster", 0);
        newMonster.setSize(32, 48);
        newMonster.setCollideWorldBounds(true);
        newMonster.anims.play("monster-standing-still", true);
        newMonster.speed = 50;

        if (newMonster.body) newMonster.body.allowGravity = false;
        const groundY = findGroundY(spawnX, this.layerChao);
        newMonster.setPosition(spawnX, groundY - newMonster.displayHeight / 2);
        if (newMonster.body) {
          newMonster.body.allowGravity = true;
          newMonster.setVelocityY(0);
        }

        this.currentMonsterIndex++;
      }
    };
    
    // CÓDIGO NOVO: Ativando a física nas novas camadas

// 1. Colisão no chão principal
if (this.layerChao) {
  this.layerChao.setCollisionByProperty({ collides: true });
  this.physics.add.collider(this.astronauta, this.layerChao);
  this.physics.add.collider(this.monsters, this.layerChao);
}

// 2. Colisão nas plataformas, pedras extras e armadilhas
const camadasComColisao = [this.layerRockB1, this.layerRockB2, this.layerTrap1, this.layerTrap2];

camadasComColisao.forEach(layer => {
  if (layer) {
    // Ativa a colisão na camada
    layer.setCollisionByProperty({ collides: true });
    
    // Faz o astronauta e os monstros baterem nela e não atravessarem
    this.physics.add.collider(this.astronauta, layer);
    this.physics.add.collider(this.monsters, layer);

    // Efeito de plataforma "atravessável por baixo" (tipo Mario)
    layer.forEachTile((tile) => {
      if (tile.properties && tile.properties.collides) {
        tile.setCollision(false, false, true, false);
      }
    });
  }
});
    
    // Colisão: Astronauta pisando ou batendo no Monstro
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

    // Configurando os limites da Câmera baseada no tamanho do mapa da scene1
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

    // Sistema de Pontos (Moedas)
    this.pontos = 0;
    this.iconeMoeda = this.add
      .image(45, 35, "coin")
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(2000);

    this.textoPontos = this.add
      .text(100, 22, "0", {
        fontSize: "36px",
        fill: "#ffffff",
        fontFamily: "Arial",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    // Grupo estático de moedas
    this.coins = this.physics.add.staticGroup();
    this.coins.create(400, 450, "coin");
    this.coins.create(800, 400, "coin");
    this.coins.create(1500, 450, "coin");
    this.coins.create(2200, 350, "coin");
    this.coins.create(3000, 450, "coin");

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

    // Música de fundo
    this.music = this.sound.add("music", { loop: true });
    this.music.play();

    // Controles: Joystick Virtual
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

      if (force > this.threshold) {
        this.direction = new Phaser.Math.Vector2(
          Math.cos(angle),
          Math.sin(angle),
        ).normalize();
      }

      if (this.joystick.force > 0) {
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
      } else {
        this.astronauta.setVelocityX(0);
      }
    });

    // Botão de Pular
    this.jumpButton = this.add
      .sprite(750, 400, "buttons", 8)
      .setInteractive()
      .setScrollFactor(0);

    this.jumpButton
      .on("pointerdown", () => {
        this.jumpButton.setFrame(9);
        this.jump(this.astronauta, this.physics.world.gravity.y);
      })
      .on("pointerup", () => {
        this.jumpButton.setFrame(8);
      });

    // Configurações de Vida do HUD
    this.vidaMaxima = 4;
    this.vidaAtual = 4;
    this.podeTomarDano = true;
    this.hudVida = this.add
      .image(100, 80, "vida_cheia")
      .setScrollFactor(0)
      .setDepth(2000)
      .setScale(1.5);

    // Configuração multiplayer atualizada para escutar scene1
    this.game.socket.on("scene1", (state) => {
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
            remotePlayer = { id: state.astronauta.id, sprite: remoteSprite };
            this.remotePlayers.push(remotePlayer);
          }

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
          console.error("Error updating remote player:", e);
        }
      }
    });
  }

  update() {
    // Fica parado se não houver movimento voluntário nas direções x e y
    if (
      this.astronauta.body.velocity.x === 0 &&
      this.astronauta.body.velocity.y === 0 &&
      (this.astronauta.body.blocked.down || this.astronauta.body.blocked.up)
    ) {
      this.astronauta.anims.play("standing-still", true);
    }

    // Morte por queda no buraco baseado no tamanho dinâmico do mapa atual
    if (this.astronauta && this.astronauta.y > this.map.heightInPixels - 20) {
      this.astronauta.setTint(0xff0000);
      this.physics.pause();
      if (this.music) this.sound.stopAll();
      console.log("O astronauta caiu no buraco da scene1!");
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

    // Gatilho do primeiro monstro (Igual ao comportamento refinado da scene0)
    if (
      this.astronauta &&
      this.astronauta.x > 800 &&
      !this.firstMonsterSpawned
    ) {
      this.firstMonsterSpawned = true;
      this.spawnNextMonster();
      console.log("Gatilho ativado na scene1! Monstro adicionado.");
    }

    // Inteligência Avançada dos Monstros (Com IA de pulo importada da scene0)
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

          // Inclusão da inteligência de pulo sobre os blocos da Caverna!
          if (
            (monster.body.blocked.left || monster.body.blocked.right) &&
            monster.body.blocked.down
          ) {
            monster.setVelocityY(-150);
          }
        }
      });
    }

    // Envia dados para o servidor via Socket sobre a scene1
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

    // Fim da fase final (Vitória do Jogo)
    if (this.astronauta && this.astronauta.x >= this.map.widthInPixels - 100) {
      this.astronauta.setVelocity(0, 0);
      if (this.astronauta.body) this.astronauta.body.allowGravity = false;
      if (this.music) this.sound.stopAll();

      console.log("Astronauta completou a scene1 com maestria!");

      this.scene.stop("scene1");
      this.scene.start("GameOver"); // Mude para uma cena de "Victory" se possuir futuramente
      return;
    }
  }

  jump(astronauta, gravity) {
    if (gravity > 0) {
      if (astronauta.body.blocked.down) {
        astronauta.setVelocityY(-170); // Um pouco mais de impulso para os pulos complexos da caverna
        astronauta.anims.play("jumping", true);
      } else if (astronauta.body.blocked.up) {
        astronauta.setVelocityY(170);
        astronauta.anims.play("jumping", true);
      }
    }
  }

  levarDano() {
    if (!this.podeTomarDano) return;

    this.vidaAtual--;
    this.podeTomarDano = false;
    this.astronauta.setTint(0xff0000);

    if (this.vidaAtual === 3 || this.vidaAtual === 2) {
      this.hudVida.setTexture("vida_media");
    } else if (this.vidaAtual === 1) {
      this.hudVida.setTexture("vida_baixa");
    }

    if (this.vidaAtual <= 0) {
      this.physics.pause();
      if (this.music) this.sound.stopAll();
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

  pegarMoeda(astronauta, coin) {
    coin.destroy();
    this.pontos++;
    this.textoPontos.setText("x " + this.pontos);
    console.log("Moeda coletada na scene1! Total:", this.pontos);
  }
}

export default scene1;
