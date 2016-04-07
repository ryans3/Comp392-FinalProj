/*
 *  This is a gulp file that is used to simplify the transcompiling process of 
 *  TypeScript files to JavaScript files. Once the default gulp is called the 
 *  transcompiling begins as soon as the changes to .html, .css, and .ts files 
 *  are made.
 *  
 *  Source File Name:   gulpfile.js
 *  Author Name:        Mohammed Juned Ahmed (300833356)
 *                      Joshua Collaco (300507555)
 *  Last Modified by:   Mohammed Juned Ahmed
 *  Date Last Modified: March 20, 2016
 *  Revision History:   1.0.1
 */
// Add required method for JS
var gulp = require("gulp");
var gutil = require("gulp-util");
var debug = require('gulp-debug');
var inject = require('gulp-inject');
var tsc = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var tscProject = tsc.createProject('tsconfig.json');
var connect = require('gulp-connect');
var open = require('gulp-open');

// Declare file sources
var TypeScriptSources = [
    './Scripts/**/*.ts',
    './typings/**/*.ts'];

var HTMLSources = ['./**/*.html'];

var CSSSources = ['./Content/**/*.css'];    

// This task Transpiles TypeScript to JavaScript
gulp.task('transpile', function () {
    gutil.log("transpiling...");

    var tsResult = gulp.src(TypeScriptSources)
        .pipe(sourcemaps.init())
        .pipe(tsc(tscProject))
        .on('error', gutil.log);

    tsResult.dts.pipe(gulp.dest('./Scripts/'));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./Scripts/'))
        .on('error', gutil.log)
        .pipe(connect.reload());

});

// This task reloads the browser when any changes occur to html pages
gulp.task("html", function () {
    gutil.log("html changed...");
    gulp.src(HTMLSources)
    .pipe(connect.reload());
});

// This task reloads the browser when any changes occur to css files
gulp.task('css', function(){
   gutil.log("css files changed...");
   gulp.src(CSSSources)
   .pipe(connect.reload());
});

// This task watches .ts .js and .html files for any changes
gulp.task("watch", function () {
    gulp.watch(TypeScriptSources, ['transpile']);
    gulp.watch(HTMLSources, ['html']);
    gulp.watch(CSSSources, ['css']);
});

// This task creates a local server and turns on livereload functionality
gulp.task("connect", function () {
    connect.server({
        root: './',
        livereload: true
    });
});

// This task opens Chrome within the local connect server
gulp.task('open', function () {
    gulp.src('./index.html')
        .pipe(open({uri: 'http://localhost:8080'}));
});

// This is the default task that runs everything
gulp.task("default", ["transpile", "html", "css", "connect", "open", "watch"]);