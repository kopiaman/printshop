'use strict';
var bases = {
	app: 'app/',
	dist: '../dist/',
};
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    tinylr = require('tiny-lr'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
	filter = require('gulp-filter'),
	ngAnnotate  = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	templateCache = require('gulp-angular-templatecache'),
    autoprefixer = require('gulp-autoprefixer'),
	rename = require('gulp-rename');

// Modules for webserver and livereload
var express = require('express'),
	refresh = require('gulp-livereload'),
	livereload = require('connect-livereload'),
	livereloadport = 35729,
	serverport = 8000;

// Set up an express server (not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./../dist'));

// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
	res.sendfile('index.html', { root: '../dist' });
});

// Dev task
gulp.task('dev', ['clean', 'views', 'css', 'bundle', 'js'], function() { });

// Clean task
gulp.task('clean', function() {
	/*return gulp.src(bases.dist)
	.pipe(clean());*/
});

// JSHint task
/*gulp.task('lint', function() {
  gulp.src('app/scripts/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});
*/
	
gulp.task('js', function () {
	gulp.src(
	[
	'app/**/main.js',
	'app/**/*.js'
	])
	.pipe(concat('app.js'))
	.pipe(gulp.dest('../dist/'))
	.pipe(ngAnnotate())
	.pipe(uglify({preserveComments:'some'}))
	.pipe(rename({ extname: '.min.js' }))
	.pipe(gulp.dest('../dist/'));
})

// Styles task
gulp.task('css', function() {
	
	gulp.src('app/css/**/*.css')
	  // And put it in the dist folder
	  .pipe(gulp.dest('../dist/css/'));
	  
	gulp.src([
		"bower_components/angularjs-slider/dist/rzslider.css",
		"bower_components/perfect-scrollbar/src/perfect-scrollbar.css"
    ])
    .pipe(concat('bundle.css'))
	.pipe(minifyCSS())
    .pipe(gulp.dest('../dist/css/'));
	
  gulp.src('app/css/bootstrap.less')
	  // The onerror handler prevents Gulp from crashing when you make a mistake in your LESS
	  .pipe(less({onError: function(e) { console.log(e); } }))
	  // Optionally add autoprefixer
	  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
	  // These last two should look familiar now :)
	  .pipe(minifyCSS())
	  .pipe(gulp.dest('../dist/css/'));  
  
  gulp.src('app/css/theme.less')
	  // The onerror handler prevents Gulp from crashing when you make a mistake in your LESS
	  .pipe(less({onError: function(e) { console.log(e); } }))
	  // Optionally add autoprefixer
	  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
	  // These last two should look familiar now :)
	  .pipe(minifyCSS())
	  .pipe(gulp.dest('../dist/css/'));
});

// Views task
gulp.task('views', function() {
  // Get our index.html
  gulp.src('app/index.html')
  // And put it in the dist folder
  .pipe(gulp.dest('../dist/'));
  
  gulp.src('app/views/**/*')
		.pipe(templateCache('templatescache.js', { module:'templatescache', standalone:true, root: './' }))
		.pipe(gulp.dest('../dist/'))
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('../dist/'));
		
	// Get our index.html
  gulp.src('app/css/images/**/*')
	  // And put it in the dist folder
	  .pipe(gulp.dest('../dist/css/images/'));

});

gulp.task('watch', [], function() {
	
	// Start webserver
	gutil.log('Start webserver', serverport);
	server.listen(serverport, function() {
		gutil.log('Listening on', serverport);
    });
	gutil.log('Start live reload', livereloadport);
	// Start live reload
	refresh.listen(livereloadport);

	// Watch our less files
	gulp.watch(['app/css/**/*.less'], [
		'css'
	]);
	gulp.watch(['app/css/**/*.css'], [
		'css'
	]);

	gulp.watch(['app/**/*.html'], [
		'views'
	]);

	gulp.watch('app/**/*.js', ['js']);

	gulp.watch('../dist/**/*.html').on('change', refresh.changed);
	gulp.watch('../dist/**/*.js').on('change', refresh.changed);
	gulp.watch('../dist/**/*.css').on('change', refresh.changed);

});

var gettext = require('gulp-angular-gettext');

gulp.task('pot', function () {
    return gulp.src(['app/**/*.html', 'app/scripts/**/*.js'])
        .pipe(gettext.extract('template.pot', {
            // options to pass to angular-gettext-tools...
        }))
        .pipe(gulp.dest('po/'));
});

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(gettext.compile({
            // options to pass to angular-gettext-tools...
            format: 'json'
        }))
        .pipe(gulp.dest('../dist/translations/'));
});

// This task depends on `coffee` to be finished first
gulp.task('bundle', [], function() {
  return gulp.src([
	//"bower_components/jquery/dist/jquery.js",
	//"bower_components/jquery-ui/ui/jquery-ui.js",
	//"bower_components/bootstrap/dist/js/bootstrap.js",
	"bower_components/fabric/dist/fabric.js",
	"bower_components/ng-file-upload/angular-file-upload-shim.js",
	//"bower_components/angular/angular.js",
	//"bower_components/angular-sanitize/angular-sanitize.js",
	"bower_components/angular-local-storage/dist/angular-local-storage.js",
	"bower_components/ng-file-upload/angular-file-upload.js",
	//"bower_components/lodash/dist/lodash.js",
	"bower_components/Font.js/Font.js",
	"bower_components/angular-ui-slider/src/slider.js",
	"bower_components/angularjs-slider/rzslider.js",
	"bower_components/perfect-scrollbar/src/jquery.mousewheel.js",
	"bower_components/perfect-scrollbar/src/perfect-scrollbar.js",
	"bower_components/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js",
	//"bower_components/angular-ui-router/release/angular-ui-router.js",
	"bower_components/angular-bootstrap/ui-bootstrap.js",
	"bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
	"bower_components/tinycolor/tinycolor.js",
	"bower_components/jquery-confirm/jquery.confirm.js",
	//"bower_components/spectrum/spectrum.js",
	"bower_components/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.js",
	"bower_components/rn-lazy/src/lazy.js",
	"bower_components/jquery-knob/js/jquery.knob.js",
	"bower_components/angular-knob/src/angular-knob.js",
	"libs/bootstrap-modal-popover.js",
	"bower_components/angular-gettext/dist/angular-gettext.min.js"
    ])
    .pipe(concat('bundle.js'))
	.pipe(gulp.dest('../dist/'))
    .pipe(uglify())
	.pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('../dist/'));
		
});

gulp.task('default', ['dev', 'watch']);

