(function () {
  const scenes = (window.MergePawsScenes = window.MergePawsScenes || {});
  const GRID_COLUMNS = 6;
  const GRID_ROWS = 8;
  const SAVE_KEY = 'merge_paws_save';
  const CAT_LEVELS = [
    { name: 'Kitten', coins: 1, color: 0xffc1cc },
    { name: 'Teen', coins: 4, color: 0xffe3a1 },
    { name: 'Adult', coins: 15, color: 0xb2f7ef },
    { name: 'Rare', coins: 60, color: 0xc3b1e1 },
    { name: 'Legendary', coins: 250, color: 0xf8f38d },
  ];

  class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
      this.cats = [];
      this.slots = [];
      this.state = null;
      this.coinText = null;
      this.coinPerSecondText = null;
      this.boostText = null;
    }

    create() {
      this.loadState();
      this.createBackground();
      this.createHeader();
      this.createParticleTexture();
      this.createGrid();
      this.createButtons();
      this.createCats();
      this.createIncomeTimer();
      this.createRandomEventTimer();
    }

    createBackground() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x1b1b2b).setOrigin(0.5);
      this.add.text(width / 2, 40, 'Merge Paws Shelter', {
        fontSize: '28px',
        color: '#ffffff',
      }).setOrigin(0.5);
    }

    createHeader() {
      const { width } = this.scale;
      this.coinText = this.add.text(40, 90, '', {
        fontSize: '24px',
        color: '#ffd27f',
      });
      this.coinPerSecondText = this.add.text(40, 120, '', {
        fontSize: '20px',
        color: '#ffffff',
      });
      this.boostText = this.add.text(width - 40, 90, '', {
        fontSize: '18px',
        color: '#b6f3ff',
        align: 'right',
      }).setOrigin(1, 0);
      this.updateHeader();
    }

    createGrid() {
      const { width, height } = this.scale;
      const gridWidth = width * 0.9;
      const gridHeight = height * 0.65;
      const startX = (width - gridWidth) / 2;
      const startY = height * 0.18;
      const slotWidth = gridWidth / GRID_COLUMNS;
      const slotHeight = gridHeight / GRID_ROWS;
      this.slots = [];

      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLUMNS; col += 1) {
          const x = startX + col * slotWidth + slotWidth / 2;
          const y = startY + row * slotHeight + slotHeight / 2;
          const slot = {
            index: row * GRID_COLUMNS + col,
            x,
            y,
            occupiedBy: null,
          };
          this.add
            .rectangle(x, y, slotWidth - 12, slotHeight - 12, 0x2c2c3c)
            .setStrokeStyle(2, 0x3f3f5a)
            .setOrigin(0.5);
          this.slots.push(slot);
        }
      }
    }

    createParticleTexture() {
      if (this.textures.exists('spark')) {
        return;
      }
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture('spark', 16, 16);
      graphics.destroy();
    }

    createButtons() {
      const { width, height } = this.scale;
      const menuButton = this.add
        .rectangle(width * 0.2, height * 0.92, 160, 60, 0x78c2ff)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(width * 0.2, height * 0.92, 'Menu', {
          fontSize: '22px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const shopButton = this.add
        .rectangle(width * 0.5, height * 0.92, 160, 60, 0xff9f68)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(width * 0.5, height * 0.92, 'Shop', {
          fontSize: '22px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const miniButton = this.add
        .rectangle(width * 0.8, height * 0.92, 160, 60, 0xf6f740)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(width * 0.8, height * 0.92, 'Mini', {
          fontSize: '22px',
          color: '#1b1b2b',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      menuButton.on('pointerdown', () => {
        this.saveState();
        this.scene.start('MainMenu');
      });

      shopButton.on('pointerdown', () => {
        this.saveState();
        this.scene.start('ShopScene');
      });

      miniButton.on('pointerdown', () => {
        this.saveState();
        this.scene.start('MiniGameScene');
      });
    }

    createCats() {
      if (this.state.cats.length === 0) {
        const starterSlots = [0, GRID_COLUMNS + 1];
        starterSlots.forEach((slotIndex) => {
          this.spawnCat(1, slotIndex);
        });
      } else {
        this.state.cats.forEach((catData) => {
          this.spawnCat(catData.level, catData.slotIndex);
        });
      }
    }

    spawnCat(level, slotIndex) {
      const slot = this.slots[slotIndex];
      if (!slot || slot.occupiedBy) {
        return null;
      }

      const catInfo = CAT_LEVELS[level - 1];
      const container = this.add.container(slot.x, slot.y);
      // TODO: replace placeholder rectangle with pixel art sprites (kitten_level1.png, adult_level3.png, etc.).
      const body = this.add
        .rectangle(0, 0, 80, 80, catInfo.color)
        .setStrokeStyle(3, 0xffffff);
      const label = this.add
        .text(0, 0, `🐱\n${catInfo.name}`, {
          fontSize: '16px',
          color: '#1b1b2b',
          align: 'center',
        })
        .setOrigin(0.5);
      container.add([body, label]);

      container.setSize(80, 80);
      container.setInteractive({ draggable: true, useHandCursor: true });
      this.input.setDraggable(container);

      const cat = {
        level,
        slotIndex,
        container,
        label,
      };
      this.cats.push(cat);
      slot.occupiedBy = cat;

      container.on('dragstart', () => {
        container.setScale(1.1);
      });

      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
      });

      container.on('dragend', () => {
        container.setScale(1);
        this.handleDrop(cat);
      });

      return cat;
    }

    handleDrop(cat) {
      const nearestSlot = this.getNearestSlot(cat.container.x, cat.container.y);
      if (!nearestSlot) {
        this.snapCat(cat, cat.slotIndex);
        return;
      }

      if (nearestSlot.occupiedBy && nearestSlot.occupiedBy !== cat) {
        if (nearestSlot.occupiedBy.level === cat.level) {
          this.mergeCats(cat, nearestSlot.occupiedBy, nearestSlot.index);
        } else {
          this.snapCat(cat, cat.slotIndex);
        }
        return;
      }

      this.moveCatToSlot(cat, nearestSlot.index);
    }

    getNearestSlot(x, y) {
      let closest = null;
      let closestDistance = Infinity;
      this.slots.forEach((slot) => {
        const distance = Phaser.Math.Distance.Between(x, y, slot.x, slot.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = slot;
        }
      });
      return closestDistance < 120 ? closest : null;
    }

    snapCat(cat, slotIndex) {
      const slot = this.slots[slotIndex];
      this.tweens.add({
        targets: cat.container,
        x: slot.x,
        y: slot.y,
        duration: 150,
        ease: 'Quad.easeOut',
      });
    }

    moveCatToSlot(cat, slotIndex) {
      const currentSlot = this.slots[cat.slotIndex];
      const nextSlot = this.slots[slotIndex];
      if (currentSlot) {
        currentSlot.occupiedBy = null;
      }
      nextSlot.occupiedBy = cat;
      cat.slotIndex = slotIndex;
      this.snapCat(cat, slotIndex);
      this.saveState();
    }

    mergeCats(catA, catB, targetSlotIndex) {
      const nextLevel = Math.min(catA.level + 1, CAT_LEVELS.length);
      const targetSlot = this.slots[targetSlotIndex];

      this.removeCat(catA);
      this.removeCat(catB);

      const merged = this.spawnCat(nextLevel, targetSlotIndex);
      if (merged) {
        merged.container.setScale(0.6);
        this.tweens.add({
          targets: merged.container,
          scale: 1,
          duration: 180,
          ease: 'Back.easeOut',
        });
      }

      this.emitMergeParticles(targetSlot.x, targetSlot.y);
      this.sound.play('mergeSound', { volume: 0.5 });
      this.updateHeader();
      this.saveState();
      window.MergePaws.showInterstitial();
    }

    emitMergeParticles(x, y) {
      const particles = this.add.particles(0, 0, 'spark');
      particles.createEmitter({
        x,
        y,
        speed: { min: 40, max: 120 },
        scale: { start: 0.6, end: 0 },
        lifespan: 500,
        quantity: 12,
        tint: [0xff9f68, 0xf8c8dc, 0xf6f740],
      });
      this.time.delayedCall(600, () => {
        particles.destroy();
      });
    }

    removeCat(cat) {
      const slot = this.slots[cat.slotIndex];
      if (slot && slot.occupiedBy === cat) {
        slot.occupiedBy = null;
      }
      const index = this.cats.indexOf(cat);
      if (index >= 0) {
        this.cats.splice(index, 1);
      }
      cat.container.destroy();
    }

    createIncomeTimer() {
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          const income = this.getTotalIncome();
          this.state.coins += income;
          this.sound.play('purrSound', { volume: 0.2 });
          this.updateHeader();
        },
      });
    }

    createRandomEventTimer() {
      const schedule = () => {
        const delay = Phaser.Math.Between(30000, 60000);
        this.time.delayedCall(delay, () => {
          const bonus = Phaser.Math.Between(50, 200);
          this.state.coins += bonus;
          this.updateHeader();
          this.showToast(`Cat event! +${bonus} coins`);
          schedule();
        });
      };
      schedule();
    }

    showToast(message) {
      const { width } = this.scale;
      const toast = this.add
        .text(width / 2, 160, message, {
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#3f3f5a',
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: toast,
        alpha: 0,
        y: toast.y - 20,
        duration: 1200,
        ease: 'Quad.easeOut',
        onComplete: () => toast.destroy(),
      });
    }

    getTotalIncome() {
      const baseIncome = this.cats.reduce((sum, cat) => {
        return sum + CAT_LEVELS[cat.level - 1].coins;
      }, 0);
      const boosted = baseIncome * this.getMultiplier();
      return Math.floor(boosted);
    }

    getMultiplier() {
      const now = Date.now();
      const boostActive = now < this.state.rewardedUntil;
      const rewardMultiplier = boostActive ? 2 : 1;
      return rewardMultiplier * this.state.permanentMultiplier;
    }

    updateHeader() {
      const income = this.getTotalIncome();
      this.coinText.setText(`Coins: ${this.state.coins}`);
      this.coinPerSecondText.setText(`Income: ${income}/s`);

      const rewardRemaining = Math.max(0, this.state.rewardedUntil - Date.now());
      const rewardMinutes = Math.ceil(rewardRemaining / 60000);
      const rewardText = rewardRemaining > 0 ? `x2 Rewarded: ${rewardMinutes}m` : 'x2 Rewarded: off';
      this.boostText.setText(`${rewardText}\nPermanent x${this.state.permanentMultiplier}`);
    }

    loadState() {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          this.state = {
            coins: parsed.coins || 0,
            cats: parsed.cats || [],
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
        cats: [],
        rewardedUntil: 0,
        permanentMultiplier: 1,
      };
    }

    saveState() {
      const catsData = this.cats.map((cat) => ({
        level: cat.level,
        slotIndex: cat.slotIndex,
      }));
      const payload = {
        coins: this.state.coins,
        cats: catsData,
        rewardedUntil: this.state.rewardedUntil,
        permanentMultiplier: this.state.permanentMultiplier,
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    }
  }

  scenes.GameScene = GameScene;
})();
