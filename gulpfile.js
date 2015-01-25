var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload'),
  ts = require('gulp-typescript'),
  sass = require('gulp-sass');

gulp.task('sass', function () {
  console.log('Compiling sass');
  return gulp.src('./public/scss/style.scss')
    .pipe(sass())
    .pipe(gulp.dest('deploy/public/css'));
});

gulp.task('reload-sass', function() {
  console.log('Compiling sass');
  return gulp.src('./public/scss/style.scss')
    .pipe(sass())
    .pipe(gulp.dest('deploy/public/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./public/scss/*.scss', ['reload-sass']);
  gulp.watch('./server/**/*.ts', ['typescript']);
});

gulp.task('typescript', function() {
  console.log('Compiling typescript');
  return gulp.src(['server/**/*.ts'])
    .pipe(ts({module: 'commonjs'})).js.pipe(gulp.dest('./deploy/server'))
});

gulp.task('images', function() {
  gulp.src('public/images/**/*').pipe(gulp.dest('deploy/public/images'))
});

gulp.task('views', function() {
  gulp.src('views/**/*').pipe(gulp.dest('deploy/views'))
});

gulp.task('build', ['sass', 'typescript', 'images', 'views']);

gulp.task('deploy', ['build'], function() {
  return gulp.src(['package.json', 'Procfile'])
    .pipe(gulp.dest('./deploy'));
});

gulp.task('serve', function () {
  livereload.listen();
  nodemon({
    script: 'deploy/server/index.js',
    ext: 'js ejs',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed();
    }, 500);
  });
});

gulp.task('default', [
  'build',
  'watch',
  'serve'
]);
