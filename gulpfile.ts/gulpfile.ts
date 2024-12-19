/* eslint-disable @typescript-eslint/no-require-imports */
const gulp = require('gulp');

gulp.task('hello', function (cb: () => void) {
  console.log('Welcome to Gulp2');

  cb();
});
