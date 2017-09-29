var gulp = require("gulp");
var ts = require("gulp-typescript");
var browserify = require('gulp-browserify');
var minify = require('gulp-minify');
var tsProject = ts.createProject("tsconfig-for-gulp.json");

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject()).js
        .pipe(browserify())
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'.js'
            }
        }))
        .pipe(gulp.dest("dist/js"));
});