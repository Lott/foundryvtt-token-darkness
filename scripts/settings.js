export default class Settings {
  static MODULE_NAME = 'foundryvtt-token-darkness';
  static SETTINGS_LIST = [
    `${Settings.MODULE_NAME}.enabled`,
    `${Settings.MODULE_NAME}.debug`,
    `${Settings.MODULE_NAME}.chatOutput`,
    `${Settings.MODULE_NAME}.globalCheckEnabled`,
    `${Settings.MODULE_NAME}.globalDimThreshold`,
    `${Settings.MODULE_NAME}.globalDarkThreshold`,
  ];

  registerSettings() {
    game.settings.register(Settings.MODULE_NAME, 'enabled', {
      name: game.i18n.format('TokenDarkness.enabled_name'),
      hint: game.i18n.format('TokenDarkness.enabled_hint'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
      requiresReload: true,
    });

    game.settings.register(Settings.MODULE_NAME, 'debug', {
      name: game.i18n.format('TokenDarkness.debug_name'),
      hint: game.i18n.format('TokenDarkness.debug_hint'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });

    game.settings.register(Settings.MODULE_NAME, 'chatOutput', {
      name: game.i18n.format('TokenDarkness.chatoutput_name'),
      hint: game.i18n.format('TokenDarkness.chatoutput_hint'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });

    game.settings.register(Settings.MODULE_NAME, 'globalCheckEnabled', {
      name: game.i18n.format('TokenDarkness.globalcheck_enabled_name'),
      hint: game.i18n.format('TokenDarkness.globalcheck_enabled_hint'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    game.settings.register(Settings.MODULE_NAME, 'globalDimThreshold', {
      name: game.i18n.format('TokenDarkness.globaldimthreshold_name'),
      hint: game.i18n.format('TokenDarkness.globaldimthreshold_hint'),
      scope: 'world',
      config: true,
      default: 0.35,
      range: {
        min: 0,
        max: 1,
        step: 0.05,
      },
      type: Number,
    });

    game.settings.register(Settings.MODULE_NAME, 'globalDarkThreshold', {
      name: game.i18n.format('TokenDarkness.globaldarkthreshold_name'),
      hint: game.i18n.format('TokenDarkness.globaldarkthreshold_hint'),
      scope: 'world',
      config: true,
      default: 0.7,
      range: {
        min: 0,
        max: 1,
        step: 0.05,
      },
      type: Number,
    });
  }

  get allSettings() {
    console.log(Settings.MODULE_NAME, 'allSettings', this.enabled);
    return {
      enabled: this.enabled,
      debug: this.debug,
      chatDebug: this.chatDebug,
      globalCheckEnabled: this.globalCheckEnabled,
      dimThreshold: this.dimThreshold,
      darkThreshold: this.darkThreshold,
    };
  }

  get enabled() {
    return game.settings.get(Settings.MODULE_NAME, 'enabled');
  }

  get debug() {
    return game.settings.get(Settings.MODULE_NAME, 'debug');
  }

  get chatDebug() {
    return game.settings.get(Settings.MODULE_NAME, 'chatOutput');
  }

  get globalCheckEnabled() {
    return game.settings.get(Settings.MODULE_NAME, 'globalCheckEnabled');
  }

  get dimThreshold() {
    return game.settings.get(Settings.MODULE_NAME, 'globalDimThreshold');
  }

  get darkThreshold() {
    return game.settings.get(Settings.MODULE_NAME, 'globalDarkThreshold');
  }
}
