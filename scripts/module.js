import Settings from './settings.js';
import LightIcon from './LightIcon/light-icon.js';

// const TD_MODULE_NAME = 'TokenDarkness';
let TDdebug = false;
let TDgm = false;
let _settings;
let TDCurrentSettings = {};

Hooks.once('init', () => {
  _settings = new Settings();
  _settings.registerSettings();
  // game.tokenDarkness = game.tokenDarkness || {};
});

// Hooks.once('renderSidebar', () => {
//   game.tokenDarkness.lightPanel = new LightIcon();
// });

Hooks.on('ready', async () => {
  updateSettings();
  if (game.user.isGM) {
    TDgm = true;
  } else {
    TDgm = false;
  }
  if (TDdebug) console.log(Settings.MODULE_NAME, TDgm, game.user);
});

Hooks.on('updateSetting', async(setting, update) => {
  if (Settings.SETTINGS_LIST.includes(setting.key)) {
    updateSettings();
  }
});

Hooks.on('createToken', (token) => {
  if (TDdebug) console.log(Settings.MODULE_NAME, 'createToken', token, update, flags, id);
  // Check token placement
  // checkDarkness(token)

});

// Only check the light level on HUD open since that is the only place it's displayed
// Hooks.on('updateToken', async (token, update, flags, id) => {
//   if (TDdebug) console.log(Settings.TD_MODULE_NAME, 'updateToken', { token, update, flags, id });
//   // Check token darkness
//   if ('x' in update || 'y' in update || 'elevation' in update) {
//     if (TDdebug) console.log(Settings.TD_MODULE_NAME, 'New token position:', update);
//     checkDarkness(token, {
//       x: update.x,
//       y: update.y,
//       elevation: update.elevation,
//     });
//   }
// });

Hooks.on('renderTokenHUD', (app, html, data) => {
  addDarknessInfoIcon(app, html, data)
});

async function addDarknessInfoIcon(app, html, data) {
  console.log(Settings.MODULE_NAME, 'addDarknessInfoIcon start');
  let token = canvas.tokens.get(data._id);
  let doc = token.document;
  
  let position = 'left';
  let tooltipDirection = 'left'
  let hasBar = null;
  let placeElement = null;

  switch (position) {
    case 'above':
      hasBar = doc.bar2?.attribute ? 'bar1' : '';
      placeElement = '.col.middle';
      tooltipDirection = 'UP';
      break;
    case 'below':
      hasBar = doc.bar2?.attribute ? 'bar2' : '';
      placeElement = '.col.middle';
      tooltipDirection = 'DOWN';
      break;
    case 'left':
      placeElement = '.col.left'
      tooltipDirection = 'LEFT';
      break;
    case 'right':
      placeElement = '.col.right';
      tooltipDirection = 'RIGHT';
      break;
    default:
      position = 'left';
      placeElement = '.col.left';
      break;
  }

  // Until other features added, only get the light level on HUD open
  let lightLevel = ''; // doc.getFlag(Settings.TD_MODULE_NAME, 'lightLevel' );
  if (!lightLevel) {
    console.log(Settings.MODULE_NAME, 'No light level, retrieving...');
    lightLevel = await checkDarkness(doc);
    console.log(Settings.MODULE_NAME, lightLevel);
  }

  const tooltipText = "In " + (lightLevel === 'bright' ? 'Bright Light' : lightLevel === 'dim' ? 'Dim Light' : 'Darkness');

  const lightIcon = `<div class="light-icon control-icon ${hasBar}">
    <i class="fas fa-sun ${lightLevel}" data-tooltip="${tooltipText}" data-tooltip-direction="${tooltipDirection}"></i>
  </div>`

  let icon = $(`<div class="token-darkness-wrapper ${position} ${hasBar}">${lightIcon}</div>`);
  let newDiv = '<div class="token-darkness-container">';
  
  // html.find('.col.middle').wrap(newDiv);
  // position === 'above' ? html.find('.attribute.bar2').before(icon) : html.find('.attribute.bar1').after(icon) ;

  html.find(placeElement).wrap(newDiv);
  switch (position) {
    case 'left':
      const t = html.find('.control-icon[data-action=config]');
      if (t && t.length) {
        t.before(icon);
        // html.find('.control-icon[data-action=config]').before(icon);
      }
      else {
        html.find('.col.left').children().last().before(icon);
      }
      break;
    case 'right':
      html.find(placeElement).children().first().before(icon);
      break;
    case 'above':
      html.find(placeElement).before(icon);
      break;
    case 'below':
      html.find(placeElement).after(icon);
      break;  
  }
}

function updateSettings() {
  TDCurrentSettings = _settings.allSettings;
  TDdebug = _settings.debug;

  if (TDdebug) console.log(Settings.MODULE_NAME, 'settings', TDCurrentSettings, TDdebug);
}

async function checkDarkness(tokenDocument) {
  if (!TDgm) {
    console.log(Settings.MODULE_NAME, 'Not the GM');
    return;
  }
  if (canvas.scene === null) {
    console.log(Settings.MODULE_NAME, 'No canvas');
    return;
  }

  let lightState = {
    dimLight: false,
    dimLightDistance: null,
    brightLight: false,
    brightLightDistance: null,
    dimDark: false,
    dimDarkDistance: null,
    brightDark: false,
    brightDarkDistance: null,
    globalLight: null
  }

  canvas.scene.globalLight && !canvas.scene.globalLightThreshold

  const unitsPerGrid = canvas.scene.grid.distance;
  const pixPerGrid = canvas.scene.grid.size;
  const pixPerUnit = pixPerGrid / unitsPerGrid;

  // For non-square tokens
  const tokenRadius =
    ((0.5 * (tokenDocument.texture.scaleX + tokenDocument.texture.scaleY)) / 2) *
    ((tokenDocument.width + tokenDocument.height) / 2) *
    pixPerGrid;
  const tCenter = {
    x: tokenDocument.x + (pixPerGrid / 2) * tokenDocument.width * tokenDocument.texture.scaleX,
    y: tokenDocument.y + (pixPerGrid / 2) * tokenDocument.height * tokenDocument.texture.scaleY,
  };

  if (TDdebug)
    console.log(Settings.MODULE_NAME, tCenter, {
      pix: pixPerGrid,
      x: tokenDocument.x,
      y: tokenDocument.y,
      width: tokenDocument.width,
      height: tokenDocument.height,
      scaleX: tokenDocument.texture.scaleX,
      scaleY: tokenDocument.texture.scaleY,
    });

  const sceneLights = canvas.scene.lights.map((l) => {
    return {
      center: l.object.center,
      brightR: l.config.bright * pixPerUnit,
      dimR: l.config.dim * pixPerUnit,
      luminosity: l.config.luminosity,
    };
  });

  const tokenLights = canvas.tokens.placeables
    .filter((x) => x.emitsLight)
    .map((t) => {
      return {
        center: t.center,
        brightR: t.light.data.bright,
        dimR: t.light.data.dim,
        luminosity: t.light.data.luminosity,
      };
    });

  const allLights = [...sceneLights, ...tokenLights].sort((a, b) =>
    a.luminosity < b.luminosity ? -1 : a.luminosity > b.luminosity ? 1 : 0
  );
  const darkLights = allLights.filter( x => x.luminosity < 0);
  const lightLights = allLights.filter(x => x.luminosity >= 0)

  // Global Illumination
  // Bright Dark
  // >
  // Bright Light
  // > 
  // Dim Dark == Dim Light

  // for( const light of darkLights ) {
  //   const { center } = light;
  //   lightState.brightDark = inLight( center.x, center.y, light.brightR, tCenter, tokenRadius);
  //   // TODO: Wait on distance calculations
  //   // if (lightState.brightDark) {
  //   //   lightState.brightDarkDistance = calcDistance(center.x, center.y, tokenDocument.x, tokenDocument.y);
  //   //   break;
  //   // }
  //   if (lightState.brightDark) break;
  //   lightState.dimDark = inLight( center.x, center.y, light.dimR, tCenter, tokenRadius);
  //   // if (inDimDark) {
  //     // TODO: Wait on distance calculations
  //     // const newD = calcDistance(center.x, center.y, tokenDocument.x, tokenDocument.y);
  //     // lightState.dimDarkDistance = true;
  //     // if (!lightState.dimDarkDistance || newD < lightState.dimDarkDistance ) {
  //     //   lightState.dimDarkDistance = newD;
  //     // }
  //   // }
  // }

  // let inBrightDarkness = false;
  // let inDimDarkness = false;

  // let inDimLight = false;
  // let inBrightLight = false;
  // TODO: Being in a darkness light overrides being in a brighter normal light
  // TODO: Dim Dark > Bright Light
  for (const light of allLights) {
    const { center } = light;
    const inBright = inLight(center.x, center.y, light.brightR, tCenter, tokenRadius);
    if (inBright) {
      if (light.luminosity < 0) {
        lightState.brightDark = true;
      //   const darkDimR = Math.round(light.dimR + 0.05 * tokenRadius);
      //   const darkC = new PIXI.Circle(center.x, center.y, darkDimR);
      //   inBrightDarkness = darkC.contains(tCenter.x, tCenter.y);
        } else {
        lightState.brightLight = true;
      }
    } 

    // const brightR = Math.round(light.brightR + 0.05 * tokenRadius);
    // const brightC = new PIXI.Circle(center.x, center.y, brightR);
    // let inBrightLight = brightC.contains(tCenter.x, tCenter.y);

    // lightState.brightLight = inLight(center.x, center.y, light.brightR, tCenter, tokenRadius);
    if (lightState.brightLight || lightState.brightDark || lightState.dimDark) break;
    if (!lightState.dimLight && !lightState.dimDark) {
      const inDim = inLight(center.x, center.y, light.dimR, tCenter, tokenRadius);
      if (inDim) {
        if (light.luminosity < 0) {
          lightState.dimDark = true;
        } else if (inDim) {
          lightState.dimLight = true;
        }
      }
      // lightState.dimLight = lightState.dimLight || inLight(center.x, center.y, light.brightR, tCenter, tokenRadius);
      // const dimR = Math.round(light.dimR + 0.05 * tokenRadius);
      // const dimC = new PIXI.Circle(center.x, center.y, dimR);
      // inDimLight = inDimLight || dimC.contains(tCenter.x, tCenter.y);
    }
  }

  let lightLevel = 'unk';
  if (lightState.brightDark) {
    lightLevel = 'dark';
  } else if (lightState.brightLight) {
    lightLevel = 'bright';
  } else if (lightState.dimDark || lightState.dimLight) {
    lightLevel = 'dim';
  } else if (!lightState.dimLight && !lightState.brightLight) {
    lightLevel = 'dark';
  }
  
  if (_settings.chatDebug) {
    const message = `${tokenDocument.name} is in ${lightLevel === 'bright' ? 'bright light' : lightLevel === 'dim' ? 'dim light' : 'darkness'}`;
    await ChatMessage.create({ content: message });
  }
  if (TDdebug) console.log(Settings.MODULE_NAME, lightState);
  // const lightLevel = inBrightLight ? 'bright' : inDimLight ? 'dim' : 'dark'
  tokenDocument.setFlag('foundryvtt-token-darkness','lightLevel', lightLevel);
  return lightLevel;
}

function inLight( lightX, lightY, radius, tokenCenter, tokenRadius) {
  const r = Math.round( radius + .05 * tokenRadius);
  const c = new PIXI.Circle(lightX, lightY, radius);
  return c.contains(tokenCenter.x, tokenCenter.y);
}

function calcDistance( lx, ly, tx, ty) {
  const l = Math.abs( lx - tx );
  const w = Math.abs( ly - ty );
  return Math.sqrt( l * l + w * w);
}