const TD_MODULE_NAME = "TokenDarkness";
let TDdebug = true;
let TDgm = false;

Hooks.on("init", () => {
  game.settings.register("TokenDarkness", "debug", {
    name: game.i18n.format("TOKENDARKNESS.debug_name"),
    hint: game.i18n.format("TOKENDARKNESS.debug_hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register("TokenDarkness", "chatOutput", {
    name: game.i18n.format("TOKENDARKNESS.chatoutput_name"),
    hint: game.i18n.format("TOKENDARKNESS.chatoutput_hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })
})

Hooks.on("ready", async () => {
  if (game.settings.get("TokenDarkness", "debug")) TDdebug = true;
  if (game.user.isGM) {
    TDgm = true;
  } else {
    TDgm = false;
  }

})

Hooks.on("createToken", (token) => {
  if (TDdebug) console.log( "createToken", token, update, flags, id);
  // Check token placement
})

Hooks.on("updateToken", async (token, update, flags, id) => {
  if (TDdebug) console.log( "updateToken", token, update, flags, id);
  // Check token darkness
  if ("x" in update || "y" in update || "elevation" in update) {
    if (TDdebug) console.log( "New token position:", update);
  }
});