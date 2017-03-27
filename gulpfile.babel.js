import del from 'del';
import gulp from 'gulp';
import browserSync from 'browser-sync';

const reload = browserSync.reload;
const wiredep = require('wiredep').stream;
const $ = require('gulp-load-plugins')();

function lint(files, options) {
	return () => {
		return gulp.src(files)
			.pipe(reload({
				stream: true,
				once: true
			}))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}

gulp.task('tinypng', function() {
	gulp.src('app/**/*.{jpg,png,jpeg}')
		.pipe($.size({
			title: 'before:',
			showFiles: true
		}))
		.pipe($.tinypng('')) // INSERT YOUR API KEY
		.pipe($.size({
			title: 'after:',
			showFiles: true
		}))
		.pipe(gulp.dest('tinypng'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('wiredep', () => {
	gulp.src('app/styles/*.scss')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest('app/styles'));

	gulp.src('app/*.html')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./,
			bowerJson: require('./bower.json'),
			directory: 'bower_components'
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('default', ['clean'], () => {
	gulp.start('build');
});

gulp.task('build', ['html', 'styles', 'scripts', 'images', 'fonts'], () => {
	return gulp.src('dist/**/*').pipe($.size({
		title: 'BUILDED FILE:',
		showFiles: true
	}));
});

gulp.task('serve', ['styles'], () => {
	browserSync({
		notify: true,
		port: 9000,
		server: {
			baseDir: ['.tmp', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'app/*.html',
		'app/images/**/*',
		'.tmp/fonts/**/*'
	]).on('change', reload);

	gulp.watch('bower.json', ['wiredep']);
	gulp.watch('app/scripts/**/*.js', ['scripts']);
	gulp.watch('app/styles/**/*', ['styles']);
	gulp.watch('app/fonts/*.{eot,svg,ttf,woff,woff2}', ['fonts'])
});

gulp.task('html', () => {
	return gulp.src('app/*.html')
		.pipe($.useref({
			searchPath: ['.tmp', 'app', '.']
		}))
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.cssnano()))
		/*
		.pipe($.if('*.html', $.htmlmin({
			collapseWhitespace: true
		})))
		*/
		.pipe(gulp.dest('dist'));
});

gulp.task('styles', () => {
	return gulp.src('app/styles/*.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({
			browsers: ['last 2 version'],
			cascade: false
		}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(gulp.dest('dist/styles'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('scripts', () => {
	return gulp.src('app/scripts/**/*.js')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.babel())
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('.tmp/scripts'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('images', () => {
	return gulp.src('app/images/**/*.{jpg,jpeg,JPG,gif,png,bmp}')
		.pipe($.cache($.imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		})))
		.on('error', function(err) {
			console.log(err);
			this.end();
		})
		.pipe(gulp.dest('dist/images'))
		.pipe($.size());
});

gulp.task('fonts', () => {
	return gulp.src('app/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest('.tmp/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});