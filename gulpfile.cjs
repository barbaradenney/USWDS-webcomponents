/* gulpfile.js */
const uswds = require("@uswds/compile");

/** USWDS version */
uswds.settings.version = 3;

/** Path settings */
uswds.paths.dist.css = "./src/styles";
uswds.paths.dist.theme = "./sass/uswds";

/** Exports */
exports.init = uswds.init;
exports.compile = uswds.compile;
exports.watch = uswds.watch;