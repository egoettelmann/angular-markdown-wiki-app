var gulp 		= require('gulp');
var gutil 		= require('gulp-util');
var tap 		= require('gulp-tap');
var concat 		= require('gulp-concat');
var rename 		= require('gulp-rename');
var uglify 		= require('gulp-uglify');
var webserver 	= require('gulp-webserver');
var fs 			= require('fs');
var path 		= require('path');
var hljs 		= require('highlight.js');
var markdownIt 	= require('markdown-it');

//Loading the markdown-it plugins
var markdownItPlugins = {
	checkbox: 	require('markdown-it-task-checkbox'),
	toc: 		require('markdown-it-github-toc'),
	sections: 	require('markdown-it-header-sections'),
	container: 	require('markdown-it-container'),
	emoji: 		require('markdown-it-emoji'),
	icons: 		require('markdown-it-fontawesome'),
	modals:		require('./plugins/markdown-it-modals'),
	alerts:		require('./plugins/markdown-it-alerts'),
	colors: 	require('./plugins/markdown-it-colors.js')
};

//Loading the app plugins
var appPlugins = {
	uiRoutes:   require('./plugins/ui-router-builder'),
	todoPage:   require('./plugins/todo-page-builder')
};

//Loading the app config file
var appConfig	= require('./config');

//The paths required for the Gulp tasks
var CONFIG = {
	BOWER_DIR: 		'./bower_components/',
	NODE_DIR: 		'./node_modules/',
	JS_DIR: 		'./resources/scripts/',
	CONTENT_DIR: 	'./resources/content/'
};

//Instantiating and configuring markdown-it and its plugins
var md = new markdownIt({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
				} catch (__) {}
			}
			return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
		}
	})
	.use(markdownItPlugins.checkbox, {
		disabled: false,
		divWrap: true,
		divClass: 'checkbox checkbox-primary'
	})
	.use(markdownItPlugins.toc, {
		tocFirstLevel: 2,
		anchorLink: false,
		uiRouterLinks: true
	})
	.use(markdownItPlugins.sections)
	.use(markdownItPlugins.colors)
	.use(markdownItPlugins.emoji, {})
	.use(markdownItPlugins.icons)
	.use(markdownItPlugins.alerts, {})
	.use(markdownItPlugins.modals, {});

//Adding custom, markdown rules (tables and icons)
md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    return '<div class="table-responsive">\n'
        + '<table class="table">\n';
};
md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    return '</table>\n'
        + '</div>\n';
};
md.renderer.rules.emoji = function(token, idx) {
	return '<i class="fa fa-' + token[idx].markup + '"></i>';
};

/**********************************************
*
*   The Gulp tasks
*
**********************************************/

/**
* The 'default' task.
*  - compiles the app's pages and JS files
**/
gulp.task('default', ['js', 'img']);

/**
* The 'init' task.
*  - sets up the app by compiling external dependencies
**/
gulp.task('init', ['default', 'ext-js', 'ext-css', 'ext-fonts', 'app-markdown']);

/**
* The 'ext-js' task.
*  - compiles the external JS files (jQuery, Angular, Bootstrap, etc.)
**/
gulp.task('ext-js', function() {
	return gulp.src([
			CONFIG.BOWER_DIR + 'jquery/dist/jquery.js',
			CONFIG.BOWER_DIR + 'angular/angular.js',
			CONFIG.BOWER_DIR + 'angular-ui-router/release/angular-ui-router.js',
			CONFIG.BOWER_DIR + 'bootstrap/dist/js/bootstrap.js',
			CONFIG.BOWER_DIR + 'jquery-search/jquery.search.js',
		])
		.pipe(concat('ext.js'))
		.pipe(uglify({ preserveComments: 'license' }))
		.pipe(rename({ suffix: '.min'}))
		.pipe(gulp.dest('./public/js/'))
});

/**
* The 'ext-css' task.
*  - compiles the external CSS files (Bootstrap, FontAwesome, etc.)
**/
gulp.task('ext-css', function() {
	return gulp.src([
			CONFIG.BOWER_DIR + 'bootstrap/dist/css/bootstrap.css',
			CONFIG.BOWER_DIR + 'font-awesome/css/font-awesome.css',
			CONFIG.BOWER_DIR + 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
			CONFIG.NODE_DIR + 'highlight.js/styles/' + appConfig.highlightTheme + '.css'
		])
		.pipe(concat('ext.css'))
		.pipe(gulp.dest('./public/css/'))
});

/**
* The 'ext-fonts' task.
*  - compiles the external fonts files (Bootstrap, FontAwesome, etc.)
**/
gulp.task('ext-fonts', function() {
	return gulp.src([
			CONFIG.BOWER_DIR + 'font-awesome/fonts/*',
			CONFIG.BOWER_DIR + 'bootstrap/dist/fonts/*',
		])
		.pipe(gulp.dest('./public/fonts/'))
});

/**
* The 'js' task.
*  - compiles the app's JS files
*  - launches the 'markdown'
**/
gulp.task('js', ['markdown'], function() {
	return gulp.src([
			CONFIG.JS_DIR + 'routes.js',
			CONFIG.JS_DIR + 'app.js'
		])
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min'}))
		.pipe(gulp.dest('./public/js/'))
});

/**
* The 'img' task.
*  - copies all images to the public folder
**/
gulp.task('img', function() {
	return gulp.src([
			CONFIG.CONTENT_DIR + '**/*.jpg',
			CONFIG.CONTENT_DIR + '**/*.jpeg',
			CONFIG.CONTENT_DIR + '**/*.png',
			CONFIG.CONTENT_DIR + '**/*.gif',
		])
		.pipe(gulp.dest('./public/img/'))
});

/**
* The 'app-markdown' task.
*  - compiles the application markdown files (about, release-notes, etc.)
**/
gulp.task('app-markdown', function() {
	return gulp.src('./resources/scripts/about/**/*.md')
		.pipe(tap(function (file) {
				var result = md.render(file.contents.toString());
				file.contents = new Buffer(result);
				file.path = gutil.replaceExtension(file.path, '.html');
				return;
			})
		)
		.pipe(gulp.dest('./public/app/about/'));
});

/**
* The 'markdown' task.
*  - compiles the content's markdown files
**/
gulp.task('markdown', function() {
	if (appConfig.todoRoute) {
		appConfig.additionalRoutes = {'todo': {}};
	}
	var routesBuilder = appPlugins.uiRoutes(appConfig);
	var todoBuilder = appPlugins.todoPage(md, appConfig);
	
	return gulp.src(CONFIG.CONTENT_DIR + '**/*.md')
		.pipe(tap(function (file) {
				var fileInfo = path.parse(file.path);
				var fileName = path.basename(fileInfo.base, '.md');
				var pathList = [];
				var relPath = path.relative('./resources/content/', fileInfo.dir);
				if (relPath !== '') {
					pathList = relPath.split(path.sep);
				}
				pathList.push(fileName);
				var result = md.render(file.contents.toString(), {
					fileName: pathList
				});
				file.contents = new Buffer(result);
				file.path = gutil.replaceExtension(file.path, '.html');
				return;
			})
		)
		.pipe(tap(routesBuilder.gather))
		.pipe(gulp.dest('./public/app/'))
		.on('end', function() {
			routesBuilder.write(CONFIG.JS_DIR + 'routes.js');
			todoBuilder.write('./public/app/todo.html');
		});
});

/**
* The 'start' task.
*  - launches the internal webserver and watches the files
**/
gulp.task('start', ['watch', 'web']);

/**
* The 'watch' task.
*  - watches all content's file and triggers the 'default' task on change
**/
gulp.task('watch', function() {
	gulp.watch(CONFIG.CONTENT_DIR + '/**/*.md', ['default']); 	
});

/**
* The 'web' task.
*  - launches the internal web server
**/
gulp.task('web', function() {
	gulp.src('./public/')
		.pipe(webserver({
			port: 3000,
			livereload: true,
			fallback: 'index.html',
			open: true
		}));
});