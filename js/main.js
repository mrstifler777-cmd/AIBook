(function () {
  const mergePaws = {
    ysdk: null,
    playerName: 'Guest',
    boost: {
      rewardedUntil: 0,
      permanentMultiplier: 1,
    },
    adLocked: false,
    showRewardedVideo(onReward) {
      if (!this.ysdk || this.adLocked || !this.ysdk.adv) {
        return;
      }
      this.adLocked = true;
      this.ysdk.adv
        .showRewardedVideo({
          callbacks: {
            onRewarded: () => {
              if (onReward) {
                onReward();
              }
            },
            onClose: () => {
              this.adLocked = false;
            },
            onError: () => {
              this.adLocked = false;
            },
          },
        })
        .catch(() => {
          this.adLocked = false;
        });
    },
    showInterstitial() {
      if (!this.ysdk || this.adLocked || !this.ysdk.adv) {
        return;
      }
      this.adLocked = true;
      this.ysdk.adv
        .showFullscreenAdv({
          callbacks: {
            onClose: () => {
              this.adLocked = false;
            },
            onError: () => {
              this.adLocked = false;
            },
          },
        })
        .catch(() => {
          this.adLocked = false;
        });
    },
    purchasePremiumPack(onSuccess) {
      if (!this.ysdk || !this.ysdk.payments) {
        return;
      }
      this.ysdk.payments
        .purchase({
          id: 'premium_cat_pack',
        })
        .then(() => {
          if (onSuccess) {
            onSuccess();
          }
        })
        .catch(() => {});
    },
  };

  window.MergePaws = mergePaws;

  function initYandexSDK() {
    if (!window.YaGames) {
      return Promise.resolve();
    }

    return window.YaGames.init()
      .then((ysdk) => {
        mergePaws.ysdk = ysdk;
        if (ysdk.player) {
          return ysdk.player.get().then((player) => {
            mergePaws.playerName = player.getName() || 'Player';
          });
        }
        return null;
      })
      .catch(() => {});
  }

  window.addEventListener('load', () => {
    initYandexSDK().finally(() => {
      const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 720,
        height: 1280,
        backgroundColor: '#1b1b2b',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scene: [
          window.MergePawsScenes.Boot,
          window.MergePawsScenes.MainMenu,
          window.MergePawsScenes.GameScene,
          window.MergePawsScenes.ShopScene,
          window.MergePawsScenes.MiniGameScene,
        ],
      };

      new Phaser.Game(config);
    });
  });
})();
