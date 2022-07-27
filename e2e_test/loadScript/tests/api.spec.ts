import { createComparePageWithFixtureTest } from '../../utils/comparePageWithFixtureTest';

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'setDefaultAttribute public API is properly supported',
  name: 'api/setDefaultAttribute',
});

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'recordError public API is properly supported',
  name: 'api/recordError',
});
