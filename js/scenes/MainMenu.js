(function () {
  const scenes = (window.MergePawsScenes = window.MergePawsScenes || {});

  class MainMenu extends Phaser.Scene {
    constructor() {
      super('MainMenu');
    }

    create() {
      const { width, height } = this.scale;

      this.add
        .rectangle(width / 2, height / 2, width, height, 0x1b1b2b)
        .setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.2, 'Merge Paws', {
          fontSize: '64px',
          color: '#f8c8dc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.28, 'Rescue • Merge • Relax', {
          fontSize: '28px',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      const playerName = window.MergePaws.playerName || 'Guest';
      this.add
        .text(width / 2, height * 0.35, `Player: ${playerName}`, {
          fontSize: '22px',
          color: '#b6f3ff',
        })
        .setOrigin(0.5);

      const startButton = this.add
        .rectangle(width / 2, height * 0.5, 320, 90, 0xff9f68)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(width / 2, height * 0.5, 'Start Game', {
          fontSize: '32px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const shopButton = this.add
        .rectangle(width / 2, height * 0.62, 320, 80, 0x78c2ff)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(width / 2, height * 0.62, 'Shop & Boosters', {
          fontSize: '26px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const miniButton = this.add
        .rectangle(width / 2, height * 0.72, 320, 80, 0xf6f740)
        .setStrokeStyle(4, 0xffffff)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(width / 2, height * 0.72, 'Mini Games', {
          fontSize: '26px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      startButton.on('pointerdown', () => {
        this.scene.start('GameScene');
      });

      shopButton.on('pointerdown', () => {
        this.scene.start('ShopScene');
      });

      miniButton.on('pointerdown', () => {
        this.scene.start('MiniGameScene');
      });

      this.add
        .text(width / 2, height * 0.88, 'Мяу~ Merge cats to grow your shelter!', {
          fontSize: '20px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
    }
  }

  scenes.MainMenu = MainMenu;
})();
