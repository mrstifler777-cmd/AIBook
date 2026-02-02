(function () {
  const scenes = (window.MergePawsScenes = window.MergePawsScenes || {});
  const SAVE_KEY = 'merge_paws_save';

  class MiniGameScene extends Phaser.Scene {
    constructor() {
      super('MiniGameScene');
      this.state = null;
      this.currentGame = null;
      this.score = 0;
      this.timerEvent = null;
    }

    create() {
      this.loadState();
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x1b1b2b).setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.12, 'Mini Games', {
          fontSize: '36px',
          color: '#f8c8dc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.18, `Coins: ${this.state.coins}`, {
          fontSize: '22px',
          color: '#ffd27f',
        })
        .setOrigin(0.5);

      this.createMenuButtons();
    }

    createMenuButtons() {
      const { width, height } = this.scale;
      this.createButton(width / 2, height * 0.32, 'Catch Mouse (Clicker)', () => this.startCatchMouse());
      this.createButton(width / 2, height * 0.45, 'Brush Fur (Timing)', () => this.startBrushFur());
      this.createButton(width / 2, height * 0.58, 'Find Treasure (Random)', () => this.startFindTreasure());
      this.createButton(width / 2, height * 0.78, 'Back', () => this.scene.start('MainMenu'));
    }

    createButton(x, y, label, onClick) {
      const button = this.add
        .rectangle(x, y, 420, 80, 0x78c2ff)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(x, y, label, {
          fontSize: '22px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      button.on('pointerdown', onClick);
      return button;
    }

    clearStage() {
      this.children.removeAll();
      this.create();
    }

    startCatchMouse() {
      this.children.removeAll();
      const { width, height } = this.scale;
      this.score = 0;
      this.currentGame = 'mouse';

      this.add.text(width / 2, 100, 'Catch the mouse! Tap fast!', {
        fontSize: '26px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const scoreText = this.add.text(width / 2, 140, 'Hits: 0', {
        fontSize: '20px',
        color: '#ffd27f',
      }).setOrigin(0.5);

      const mouse = this.add.circle(width / 2, height / 2, 50, 0xff9f68).setInteractive({ useHandCursor: true });
      const mouseText = this.add.text(width / 2, height / 2, '🐭', {
        fontSize: '42px',
      }).setOrigin(0.5);

      mouse.on('pointerdown', () => {
        this.score += 1;
        scoreText.setText(`Hits: ${this.score}`);
        mouse.x = Phaser.Math.Between(120, width - 120);
        mouse.y = Phaser.Math.Between(260, height - 220);
        mouseText.x = mouse.x;
        mouseText.y = mouse.y;
      });

      this.timerEvent = this.time.delayedCall(10000, () => {
        if (this.score >= 5) {
          this.rewardMiniGame(150 + this.score * 10);
        } else {
          this.failMiniGame();
        }
      });
    }

    startBrushFur() {
      this.children.removeAll();
      const { width, height } = this.scale;
      this.currentGame = 'brush';

      this.add.text(width / 2, 100, 'Stop the brush on the heart!', {
        fontSize: '24px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const bar = this.add.rectangle(width / 2, height / 2, 400, 30, 0x3f3f5a);
      const target = this.add.rectangle(width / 2, height / 2, 70, 30, 0xf8c8dc);
      const slider = this.add.rectangle(width / 2 - 200, height / 2, 20, 40, 0xff9f68);

      let direction = 1;
      const speed = 4;
      this.timerEvent = this.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
          slider.x += speed * direction;
          if (slider.x > width / 2 + 190 || slider.x < width / 2 - 190) {
            direction *= -1;
          }
        },
      });

      this.input.once('pointerdown', () => {
        this.timerEvent.remove();
        const distance = Math.abs(slider.x - target.x);
        if (distance < 40) {
          this.rewardMiniGame(200);
        } else {
          this.failMiniGame();
        }
      });
    }

    startFindTreasure() {
      this.children.removeAll();
      const { width, height } = this.scale;
      this.currentGame = 'treasure';

      this.add.text(width / 2, 100, 'Pick a treasure chest!', {
        fontSize: '26px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const chestPositions = [width * 0.3, width * 0.5, width * 0.7];
      chestPositions.forEach((x, index) => {
        const chest = this.add.rectangle(x, height / 2, 100, 100, 0xf6f740)
          .setStrokeStyle(3, 0xffffff)
          .setInteractive({ useHandCursor: true });
        this.add.text(x, height / 2, '🎁', { fontSize: '40px' }).setOrigin(0.5);

        chest.on('pointerdown', () => {
          const reward = Phaser.Math.Between(50, 300);
          this.rewardMiniGame(reward);
        });
      });
    }

    rewardMiniGame(amount) {
      this.state.coins += amount;
      this.saveState();
      this.showEndScreen(true, amount);
    }

    failMiniGame() {
      window.MergePaws.showInterstitial();
      this.showEndScreen(false, 0);
    }

    showEndScreen(success, reward) {
      const { width, height } = this.scale;
      this.children.removeAll();
      const message = success ? `Great job! +${reward} coins` : 'Oops! Try again!';
      const color = success ? '#b6f3ff' : '#ff8a8a';
      this.add.text(width / 2, height * 0.4, message, {
        fontSize: '30px',
        color,
      }).setOrigin(0.5);

      this.createButton(width / 2, height * 0.55, 'Play More', () => this.clearStage());
      this.createButton(width / 2, height * 0.68, 'Back to Menu', () => this.scene.start('MainMenu'));
    }

    loadState() {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          this.state = {
            coins: parsed.coins || 0,
          };
          return;
        } catch (error) {
          window.localStorage.removeItem(SAVE_KEY);
        }
      }
      this.state = { coins: 0 };
    }

    saveState() {
      const raw = window.localStorage.getItem(SAVE_KEY);
      const base = raw ? JSON.parse(raw) : {};
      const payload = {
        ...base,
        coins: this.state.coins,
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    }
  }

  scenes.MiniGameScene = MiniGameScene;
})();
