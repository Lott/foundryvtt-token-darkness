import Settings from '../settings.js';

export default class LightIconController {
  constructor(viewMvc) {
    this._viewMvc = viewMvc;
    this._settings = new Settings();
  }
}