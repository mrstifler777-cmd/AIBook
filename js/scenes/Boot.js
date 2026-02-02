(function () {
  const scenes = (window.MergePawsScenes = window.MergePawsScenes || {});

  class Boot extends Phaser.Scene {
    constructor() {
      super('Boot');
    }

    preload() {
      this.load.audio(
        'mergeSound',
        'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YVQAAAAA/////wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///w=='
      );
      this.load.audio(
        'purrSound',
        'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YVQAAAAA/v7+/wAAAP7+/v8AAAD+/v7/AAAA/v7+/wAAAP7+/v8AAAD+/v7/AAAA/v7+/wAAAP7+/v8AAAD+/v7/AAAA'
      );
    }

    create() {
      this.scene.start('MainMenu');
    }
  }

  scenes.Boot = Boot;
})();
