const gulp = require('gulp');
const zip = require('gulp-zip');

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    // body omitted
    cb();
}

function teamplaypk3(cb) {
    gulp.src(['qw/__s_timer.cfg', 'qw/__s_teamplay.cfg'])
		.pipe(zip('suddenteamplay.pk3'))
		.pipe(gulp.dest('dist'))
        .on('end', () => cb());
}
function teamplayzip(cb) {
    gulp.src(['dist/suddenteamplay.pk3', 'qw/suddenteamplay.cfg', 'qw/suddenteamplay-update.bat'])
		.pipe(zip('suddenteamplay-latest.zip'))
		.pipe(gulp.dest('dist'))
    cb();
}
  
// The `build` function is exported so it is public and can be run with the `gulp` command.
// It can also be used within the `series()` composition.
function build(cb) {
    // body omitted
    cb();
}

exports.build = build;
exports.teamplay = gulp.series(teamplaypk3, teamplayzip);
exports.default = gulp.series(clean, build);