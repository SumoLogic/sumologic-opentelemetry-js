import { createComparePageWithFixtureTest } from '../../utils/comparePageWithFixtureTest';

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'web vitals are emitted as logs to v1/logs',
  name: 'web_vitals_logs',
});
