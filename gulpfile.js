var gulp = require('gulp');
var bs = require('browser-sync');

gulp.task('browser-sync', function(done) {
    bs.init({
        server: {
            baseDir: "./"
        }
    });
    bs.reload();
    done();
});

gulp.task("watch", function(done) {
    gulp.watch("./**").on('change', bs.reload);
})

gulp.task("dev", gulp.series('browser-sync', 'watch'));