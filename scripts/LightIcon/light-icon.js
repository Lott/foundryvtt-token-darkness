import LightIconController from "./light-icon.controller.js";

export default class LightIcon extends Application {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'light-icon-panel',
      popOut: false,
      template: 'modules/foundryvtt-token-darkness/templates/light-icon.html'
    });
  }

  constructor() {
    super();
    this._controller = new LightIconController(this);

    this.refresh = foundry.utils.debounce(this.render.bind(this), 100);
    this._initialSidebarWidth = ui.sidebar.element.outerWidth();
  }

  /** @override */
  getData(options) {
    return this._controller.data;
  }

  /** @override */
  activateListeners($html) {
    this._rootView = $html;
    this._dragHandler.on(
      'mousedown',
      this._controller.onMouseDown.bind(this._controller)
    );
  }

  get _dragHandler() {
    return this._rootView.find('#effects-panel-drag-handler');
  }
}