(function () {
  const scenes = (window.MergePawsScenes = window.MergePawsScenes || {});
  const SAVE_KEY = 'merge_paws_save';

  class ShopScene extends Phaser.Scene {
    constructor() {
      super('ShopScene');
      this.state = null;
    }

    create() {
      this.loadState();
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x1b1b2b).setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.15, 'Cat Shop & Boosters', {
          fontSize: '40px',
          color: '#f8c8dc',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, height * 0.22, `Coins: ${this.state.coins}`, {
          fontSize: '24px',
          color: '#ffd27f',
        })
        .setOrigin(0.5);

      this.createButton(width / 2, height * 0.36, 420, 90, 0xff9f68, 'Watch Ad: x2 income 60m', () => {
        window.MergePaws.showRewardedVideo(() => {
          this.state.rewardedUntil = Date.now() + 60 * 60 * 1000;
          this.saveState();
          this.scene.start('GameScene');
        });
      });

      this.createButton(width / 2, height * 0.5, 420, 90, 0x78c2ff, 'Buy permanent x2 (1000 coins)', () => {
        if (this.state.coins >= 1000) {
          this.state.coins -= 1000;
          this.state.permanentMultiplier = 2;
          this.saveState();
          this.scene.start('GameScene');
        } else {
          this.showToast('Not enough coins!');
        }
      });

      this.createButton(width / 2, height * 0.64, 420, 90, 0xf6f740, 'Premium Cat Pack (IAP)', () => {
        window.MergePaws.purchasePremiumPack(() => {
          this.showToast('Premium cats delivered!');
          this.state.coins += 500;
          this.saveState();
        });
      });

      this.createButton(width / 2, height * 0.78, 320, 80, 0x3f3f5a, 'Back', () => {
        this.scene.start('MainMenu');
      });
    }

    createButton(x, y, width, height, color, label, onClick) {
      const button = this.add
        .rectangle(x, y, width, height, color)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(x, y, label, {
          fontSize: '22px',
          color: '#1b1b2b',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: width - 30 },
        })
        .setOrigin(0.5);
      button.on('pointerdown', onClick);
      return button;
    }

    showToast(message) {
      const { width } = this.scale;
      const toast = this.add
        .text(width / 2, 120, message, {
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#3f3f5a',
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5);
      this.time.delayedCall(1200, () => toast.destroy());
    }

    loadState() {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          this.state = {
            coins: parsed.coins || 0,
            rewardedUntil: parsed.rewardedUntil || 0,
            permanentMultiplier: parsed.permanentMultiplier || 1,
          };
          return;
        } catch (error) {
          window.localStorage.removeItem(SAVE_KEY);
        }
      }

      this.state = {
        coins: 0,
        rewardedUntil: 0,
        permanentMultiplier: 1,
      };
    }

    saveState() {
      const raw = window.localStorage.getItem(SAVE_KEY);
      const base = raw ? JSON.parse(raw) : {};
      const payload = {
        ...base,
        coins: this.state.coins,
        rewardedUntil: this.state.rewardedUntil,
        permanentMultiplier: this.state.permanentMultiplier,
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    }
  }

  scenes.ShopScene = ShopScene;
})();
