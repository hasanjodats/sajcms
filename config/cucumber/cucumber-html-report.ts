const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './documentation/test/cucumber/json',
  reportPath: './documentation/test/cucumber/report',
  metadata: {
    browser: {
      name: 'chrome',
      version: '60',
    },
    device: 'Local test machine',
    platform: {
      name: 'ubuntu',
      version: '24.04',
    },
  },
  customData: {
    title: 'SAJCMS',
    data: [
      { label: 'Project', value: 'Custom project' },
      { label: 'Release', value: '1.2.3' },
      { label: 'Cycle', value: 'B11221.34321' },
      { label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST' },
      { label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST' },
    ],
  },
});
