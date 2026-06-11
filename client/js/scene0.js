class scene0 extends Phaser.Scene {
  constructor() {
    super("scene0");
    this.threshold = 0.1;
    this.speed = 100;
    this.direction = undefined;
    this.remotePlayers = [];

    this.monsterPositions = [600, 1100, 1600, 2100];
    this.currentMonsterIndex = 0; // Começa no primeiro da lista
  }

  preload() {
    this.load.setPath("assets/");
    this.load.tilemapTiledJSON("mars", "mars.json");

    this.load.spritesheet("astronauta", "astronauta.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Corrigido para carregar "monster.png" conforme seu preload atual,
    // mas se o arquivo se chamar "monstro.png", mude a string abaixo para "monstro.png"
    this.load.spritesheet("monster", "monster.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.image("marte", "mars-tileset.png");

    this.load.spritesheet("buttons", "buttons.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.audio("music", "music.mp3");

    this.load.plugin(
      "rexvirtualjoystickplugin",
      "../js/rexvirtualjoystickplugin.min.js",
      true,
    );
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

    // Animações do Monstro
    this.anims.create({
      key: "monster-standing-still",
      frames: this.anims.generateFrameNumbers("monster", { start: 0, end: 0 }),
      frameRate: 5,
      repeat: -1,
    });

    // Criando o astronauta
    this.astronauta = this.physics.add.sprite(150, 0, "astronauta", 0);
    this.astronauta.setSize(32, 48);
this.monsters = this.physics.add.group();

// Lista de posições: O primeiro vai surgir bem mais para a frente (X: 1200 - metade do mapa)
this.monsterPositions = [1200, 1700, 2200];
this.currentMonsterIndex = 0;
this.firstMonsterSpawned = false;

// Função para criar o próximo monstro da lista
this.spawnNextMonster = () => {
  if (this.currentMonsterIndex < this.monsterPositions.length) {
    let spawnX = this.monsterPositions[this.currentMonsterIndex];

    // O monstro já nasce direto no chão (Y: 400 por exemplo, ou 0 para cair)
    let newMonster = this.monsters.create(spawnX, 500, "monster", 0);
    newMonster.setSize(32, 48);
    newMonster.setCollideWorldBounds(true);
    newMonster.anims.play("monster-standing-still", true);
    newMonster.speed = 50; // Velocidade ajustada que você gostou

    this.currentMonsterIndex++;
  }
};

// --- ADICIONE OS COLISORES DO GRUPO COM O CENÁRIO ---
// Isso garante que mesmo os monstros criados depois vão colidir com o chão e plataformas
this.physics.add.collider(this.monsters, this.layerceu);
this.physics.add.collider(this.monsters, this.layertub1);
this.physics.add.collider(this.monsters, this.layertub2);
this.physics.add.collider(this.monsters, this.layerchao);
this.physics.add.collider(this.monsters, this.layerplatf);

// --- ADICIONE A COLISÃO DO ASTRONAUTA COM OS MONSTROS DO GRUPO ---
this.physics.add.collider(
  this.astronauta,
  this.monsters,
  (astronauta, monster) => {
    // Pulo na cabeça elimina o monstro
    if (astronauta.body.touching.down && monster.body.touching.up) {
      monster.destroy();
      astronauta.setVelocityY(-150); // impulso para cima
      this.spawnNextMonster(); // Nasce o próximo ainda mais para frente
    } else {
      // Se tocar pelos lados, o astronauta morre
      astronauta.setTint(0xff0000);
      this.physics.pause();
      this.time.delayedCall(
        1500,
        () => {
          this.scene.restart();
        },
        [],
        this,
      );
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

    // ==========================================
    // CONFIGURANDO COLISÕES (ASTRONAUTA E MONSTRO)
    // ==========================================
    this.layerceu.setCollisionByProperty({ collides: true });
    this.layertub1.setCollisionByProperty({ collides: true });
    this.layertub2.setCollisionByProperty({ collides: true });
    this.layerchao.setCollisionByProperty({ collides: true });
    this.layerplatf.setCollisionByProperty({ collides: true });

    // Colisores do Astronauta
    this.physics.add.collider(this.astronauta, this.layerceu);
    this.physics.add.collider(this.astronauta, this.layertub1);
    this.physics.add.collider(this.astronauta, this.layertub2);
    this.physics.add.collider(this.astronauta, this.layerchao);
    this.physics.add.collider(this.astronauta, this.layerplatf);

    // Colisores do Monstro (para eles não caírem do mapa) - usar o grupo
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

    // ==========================================
    // NOVA ADIÇÃO: COLISÃO/ATAQUE DO MONSTRO NO JOGADOR
    // ==========================================
    this.physics.add.overlap(
      this.astronauta,
      this.monsters,
      this.hitPlayer,
      null,
      this,
    );

    // Som e Joystick
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

    // Socket (Multiplayer)
    this.game.socket.on("scene0", (state) => {
      if (state.astronauta) {
        try {
          if (state.astronauta.id === this.game.socket.id) return;

          let remotePlayer = this.remotePlayers.find(
            (p) => p.id === state.astronauta.id,
          );

          if (!remotePlayer) {
            remotePlayer = this.add.sprite(
              state.astronauta.x,
              state.astronauta.y,
              "alien",
              0,
            );
            this.remotePlayers.push({
              id: state.astronauta.id,
              sprite: remotePlayer,
            });
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
    // Animação padrão de parado do astronauta
    if (
      this.astronauta.body.velocity.x === 0 &&
      this.astronauta.body.velocity.y === 0 &&
      (this.astronauta.body.blocked.down || this.astronauta.body.blocked.up)
    )
      this.astronauta.anims.play("standing-still", true);
    
    if (this.astronauta && this.astronauta.y > 760) {
      // Pinta o personagem de vermelho para indicar a morte
      this.astronauta.setTint(0xff0000);
  
      // Pausa as físicas do jogo para ele parar de cair no infinito
      this.physics.pause();
  
      console.log("O astronauta caiu no buraco!");

      // Aguarda 1.5 segundos e reinicia a fase
      this.time.delayedCall(1500, () => {
        this.scene.restart();
      }, [], this);
  
      return;
    }

if (this.astronauta && this.astronauta.x > 800 && !this.firstMonsterSpawned) {
  this.firstMonsterSpawned = true;
  this.spawnNextMonster(); // Cria o monstro em X: 1200
  console.log("Gatilho ativado! Primeiro monstro apareceu na metade do caminho.");
}

if (this.monsters && this.monsters.getLength() > 0) {
  this.monsters.children.iterate((monster) => {
    if (monster && this.astronauta) {
      
      // Inteligência de seguir o astronauta
      if (this.astronauta.x > monster.x + 10) {
        monster.setVelocityX(monster.speed);
        monster.flipX = false;
      } 
      else if (this.astronauta.x < monster.x - 10) {
        monster.setVelocityX(-monster.speed);
        monster.flipX = true;
      } 
      else {
        monster.setVelocityX(0);
      }

      // Inteligência de pular paredes/obstáculos
      if ((monster.body.blocked.left || monster.body.blocked.right) && monster.body.blocked.down) {
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

  // ==========================================
  // NOVA FUNÇÃO: O QUE ACONTECE QUANDO O MONSTRO PEGA O JOGADOR
  // ==========================================
  hitPlayer(astronauta, monster) {
    // Pausa a física do astronauta para fingir que morreu
    astronauta.setTint(0xff0000); // Fica vermelho ao morrer
    this.physics.pause();

    console.log("O astronauta morreu!");

    // Reinicia a fase após 1.5 segundos
    this.time.delayedCall(
      1500,
      () => {
        this.scene.restart();
      },
      [],
      this,
    );
  }
}

export default scene0;
