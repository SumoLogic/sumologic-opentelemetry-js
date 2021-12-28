import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in Angular.js, routing is based on History API',
  fixtureName: 'angularjs.historyapi',
  urlPath: 'angularjs/',
});
