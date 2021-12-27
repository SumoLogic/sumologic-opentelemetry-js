import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in Vue.js, routing is based on History API',
  fixtureName: 'vuejs.historyapi',
  urlPath: 'vuejs/',
});
