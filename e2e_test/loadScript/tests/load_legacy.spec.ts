import { createComparePageWithFixtureTest } from '../../utils/comparePageWithFixtureTest';

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'script should load using legacy way',
  name: 'load_legacy',
});
