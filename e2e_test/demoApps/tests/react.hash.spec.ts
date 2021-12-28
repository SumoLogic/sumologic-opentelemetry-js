import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in React, routing is based on Hash',
  fixtureName: 'react.hash',
  urlPath: 'react/index_hash.html',
});
