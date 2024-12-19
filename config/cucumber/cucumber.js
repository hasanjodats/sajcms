export default {
  // parallel: 2,
  format: ['progress-bar', 'json:cucumber/result/core.json'], //Name/path and (optionally) output file path of each formatter to use
  paths: [
    'src/microservices/core/test/scenario/feature/*.feature',
    'src/microservices/core/**/test/scenario/feature/*.feature',
  ], //Paths to where your feature files are

  // backtrace: false, //Show the full backtrace for errors
  // dryRun: false, //Prepare a test run but don't run it
  // forceExit: false, //Explicitly call process.exit() after the test run (when run via CLI)
  // failFast: false, //Stop running tests when a test fails - see
  formatOptions: { snippetInterface: 'async-await' }, //Options to be provided to formatters

  // import: [], //Paths to where your support code is
  // language: en, //Default language for your feature files
  // name: [], //Regular expressions of which scenario names should match one of to be run
  // order: defined, //Run in the order defined, or in a random order
  // publish: false, //Publish a report of your test run to https://reports.cucumber.io/
  // publishQuiet: false, //Don't show info about publishing reports
  require: [
    'src/microservices/core/test/scenario/step_defenition/*.ts',
    'src/microservices/core/**/test/scenario/step_defenition/*.ts',
    'src/common/test/scenario/step_defenition/*.ts',
  ], //Paths to where your support code is, for CommonJS
  requireModule: ['ts-node/register', 'tsconfig-paths/register'], //Names of transpilation modules to load, loaded via require()
  // retry: 0, //Retry failing tests up to the given number of times
  // retryTagFilter:, //Tag expression to filter which scenarios can be retried
  // strict: true, //Fail the test run if there are pending steps
  // tags:, //Tag expression to filter which scenarios should be run
  // worldParameters: {}, //Parameters to be passed to your World
};
