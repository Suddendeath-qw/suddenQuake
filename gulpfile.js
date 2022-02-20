const gulp = require('gulp');
const zip = require('gulp-zip');
const exec = require('child_process').exec;

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    // body omitted
    cb();
}

function stpupdate (cb) {
    exec('esbuild stpupdate/stpupdate.js --bundle --outfile=stpupdate/out.js --platform=node  && pkg stpupdate/out.js -t node16-win-x64 -o stpupdate/stp_update.exe', function (err, stdout, stderr) {
        //console.log(stdout);
        //console.log(stderr);
        cb(err);
    });
}

function teamplaypk3(cb) {
    gulp.src(['qw/__s_timer.cfg', 'qw/__s_teamplay.cfg'])
		.pipe(zip('suddenteamplay.pk3'))
		.pipe(gulp.dest('dist'))
        .on('end', () => cb());
}
function teamplayzip(cb) {
    gulp.src(['dist/suddenteamplay.pk3', 'qw/suddenteamplay.cfg', 'dist/stp_update.exe'])
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
exports.teamplay = gulp.series(stpupdate, teamplaypk3, teamplayzip);
exports.default = gulp.series(clean, build);