class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  preload() {
    // Carrega a imagem que você enviou a partir da pasta assets
    this.load.setPath("assets/");
    this.load.image("gameover_bg", "gameover.png");
  }

  create() {
    // Pega a largura e altura da tela do jogo
    const largura = this.cameras.main.width;
    const altura = this.cameras.main.height;

    // Adiciona a imagem de game over bem no centro da tela
    let imagem = this.add.image(largura / 2, altura / 2, "gameover_bg");

    // Ajusta o tamanho da imagem para caber na sua tela (se necessário)
    imagem.setOrigin(0.5);

    // Cria um evento: quando o jogador tocar em QUALQUER lugar da tela...
    this.input.once("pointerdown", () => {
      // Limpa os comandos e volta para a scene0 (seu jogo principal)
      this.scene.start("scene0");
    });
  }
}

export default GameOver;
