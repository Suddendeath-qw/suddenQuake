const gulp = require('gulp');
const zip = require('gulp-zip');

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    // body omitted
    cb();
}
  
// The `build` function is exported so it is public and can be run with the `gulp` command.
// It can also be used within the `series()` composition.
function build(cb) {
    gulp.src(['qw/suddenteamplay.pk3', 'qw/suddenteamplay.cfg'])
		.pipe(zip('suddenteamplay-hej.zip'))
		.pipe(gulp.dest('dist'))
    cb();
}
  
  exports.build = build;
  exports.default = gulp.series(clean, build);