import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in React, routing is based on History API',
  fixtureName: 'react.historyapi',
  urlPath: 'react/',
});
