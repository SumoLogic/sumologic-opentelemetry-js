import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in Angular.js, routing is based on Hash',
  fixtureName: 'angularjs.hash',
  urlPath: 'angularjs/index_hash.html',
});
