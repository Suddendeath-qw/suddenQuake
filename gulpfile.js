const gulp = require('gulp');
const zip = require('gulp-zip');
const exec = require('child_process').exec;

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    // body omitted
    cb();
}

function teamplaypk3(cb) {
    gulp.src(['qw/s_timer.cfg', 'qw/s_teamplay.cfg', 'qw/**/*.wav'])
		.pipe(zip('suddenteamplay.pk3'))
		.pipe(gulp.dest('dist'))
        .on('end', () => cb());
}
function teamplayzip(cb) {
    gulp.src(['dist/suddenteamplay.pk3', 'qw/suddenteamplay.cfg', 'qw/stp_update.bat'])
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
//exports.teamplay = gulp.series(stp_esbuild, stp_pkg, teamplaypk3, teamplayzip);
exports.teamplay = gulp.series(teamplaypk3, teamplayzip);
exports.default = gulp.series(clean, build);
