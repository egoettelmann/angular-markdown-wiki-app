var gulp 		= require('gulp');
var gutil 		= require('gulp-util');
var tap 		= require('gulp-tap');
var concat 		= require('gulp-concat');
var rename 		= require('gulp-rename');
var uglify 		= require('gulp-uglify');
var fs 			= require('fs');
var path 		= require('path');
var hljs 		= require('highlight.js');
var markdownIt 	= require('markdown-it');
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
var appPlugins = {
	uiRoutes:   require('./plugins/ui-router-builder'),
	todoPage:   require('./plugins/todo-page-builder')
};
var appConfig	= require('./config');

var CONFIG = {
	BOWER_DIR: './bower_components/',
	JS_DIR: './resources/scripts/',
	CONTENT_DIR: './resources/content/'
};

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

gulp.task('default', ['js']);
gulp.task('init', ['default', 'ext-js', 'ext-css', 'ext-fonts', 'app-markdown']);

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

gulp.task('ext-css', function() {
	return gulp.src([
			CONFIG.BOWER_DIR + 'bootstrap/dist/css/bootstrap.css',
			CONFIG.BOWER_DIR + 'font-awesome/css/font-awesome.css',
			CONFIG.BOWER_DIR + 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
			'./node_modules/highlight.js/styles/' + appConfig.highlightTheme + '.css'
		])
		.pipe(concat('ext.css'))
		.pipe(gulp.dest('./public/css/'))
});

gulp.task('ext-fonts', function() {
	return gulp.src([
			CONFIG.BOWER_DIR + 'font-awesome/fonts/*',
			CONFIG.BOWER_DIR + 'bootstrap/dist/fonts/*',
		])
		.pipe(gulp.dest('./public/fonts/'))
});

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
				var result = md.render(file.contents.toString(), {
					fileName: fileName
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