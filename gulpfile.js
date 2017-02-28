/* DEV PLUGINS------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
var gulp        = require('gulp'),
		plumber     = require('gulp-plumber'),
		twig        = require('gulp-twig'),
		sass        = require("gulp-sass"),
		spritesmith = require("gulp.spritesmith"),
		prefix      = require("gulp-autoprefixer"),
		minifyCss   = require('gulp-minify-css'),
		uglify      = require('gulp-uglify'),
		sourcemaps  = require("gulp-sourcemaps"),
		clean       = require('gulp-clean'),
		browserSync = require('browser-sync');

/* PRODUCTION PLUGINS ----------------------------------------------------------
 ---------------------------------------------------------------------------- */
var useref = require('gulp-useref'),
	wiredep = require('wiredep').stream,
	gulpif = require('gulp-if');

/* SOURCES --------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
var sources = {
	html: {
		src: 'app/*.html',
		dist: 'app/'
	},
	css: {
		dist: 'app/css'
	},
	js: {
		dist: 'app/js',
		watch: 'app/js/*.js'
	},
	twig: {
		src: 'app/twig/*.twig',
		watch: 'app/twig/**/*.twig',
		temp_dist: 'app/.twig-temp/',
		temp_dist_html: 'app/.twig-temp/*.html',
		dist: 'app/'
	},
	sass: {
		src: 'app/sass/*.sass',
		watch: 'app/sass/**/*.sass',
		dist: 'app/sass'
	},
	bower: {src: 'app/bower_components'},
	images: {
		icons: 'app/images/icons/*.png',
		dist: 'app/images'
	}
};

/* DEVELOPMENT GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* Error Handler ---------------------------------------------------------------
 ---------------------------------------------------------------------------- */

var onError = function (err) {
	console.log(err);
	this.emit('end');
};

/* TWIG --------------------------------------------------------------------- */
gulp.task('twig', function () {
	gulp.src(sources.twig.src)
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(twig({
			data: {
				benefits: [
					'Fast',
					'Flexible',
					'Secure'
				]
			}
		}))
		.pipe(gulp.dest(sources.twig.dist))
		.pipe(browserSync.reload({stream: true}));

	return null;
});

/* SASS --------------------------------------------------------------------- */
gulp.task('sass', function () {
	return gulp.src(sources.sass.src)
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(prefix({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(sources.css.dist))
		.pipe(browserSync.reload({stream: true}));
});

/* SPRITES ------------------------------------------------------------------- */
gulp.task('sprites', function () {
	gulp.src(sources.images.icons)
		.pipe(spritesmith({
			imgName: '../images/sprites.png',
			cssName: '../sass/_sprites.sass',
			cssFormat: 'sass',
			padding: 0,
			imgPath: "../images/sprites.png"
		}))
		.pipe(gulp.dest(sources.images.dist));
});

/* BOWER --------------------------------------------------------------------- */
gulp.task('bower', function () {
	gulp.src(sources.html.src)
		.pipe(wiredep({
			directory: sources.bower.src
		}))
		.pipe(gulp.dest('app'));
});

/* BROWSER SYNC -------------------------------------------------------------- */
gulp.task('browser-sync', function () {
	browserSync.init({
		server: "./app"
	});
});

/* PRODUCTION GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* CLEAN -------------------------------------------------------------------- */
gulp.task('clean', function () {
	gulp.src('dist', {read: false})
		.pipe(clean());
});

/* BUILD -------------------------------------------------------------------- */
gulp.task('build', ["clean"], function () {
	setTimeout(function () {
		gulp.start('build_dist');
		gulp.start('fonts');
		gulp.start('images');
	}, 500);
});

gulp.task('build_dist', function () {
	gulp.src(sources.html.src)
		.pipe(useref())
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
	gulp.src([
		'app/fonts/**'
	])
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('images', function () {
	gulp.src([
		'app/images/**'
	])
		.pipe(gulp.dest('dist/images'));
});

/* DEFAULT AND GULP WATCHER ----------------------------------------------------
 ---------------------------------------------------------------------------- */
gulp.task('watch', function () {
	gulp.watch(sources.sass.watch, ['sass']);
	gulp.watch(sources.twig.watch, ["twig"]);
	gulp.watch(sources.js.watch).on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'twig', 'sass', 'watch']);