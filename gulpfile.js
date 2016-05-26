const gulp = require('gulp')
const sass = require('gulp-sass')
const bourbon = require('bourbon')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

gulp.task('default', [
    'sass',
    'script'
])

gulp.task('sass', function () {
    return gulp.src(['./**/*.scss', '!./node_modules/**'])
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: bourbon.includePaths,
            outputStyle: 'expanded'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'))
})

gulp.task('script', function () {
    return gulp.src(['./**/*.ts', '!./node_modules/**'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'))
})