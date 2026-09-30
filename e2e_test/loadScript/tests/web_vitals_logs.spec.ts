import { createComparePageWithFixtureTest } from '../../utils/comparePageWithFixtureTest';

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'web vitals are emitted as logs with webVitalsConfig attribution',
  name: 'web_vitals_logs',
});
