import { createVerifyDemoAppTest } from '../../utils/verifyDemoAppTest';

createVerifyDemoAppTest({
  basedir: __dirname,
  title: 'test navigation in Vue.js, routing is based on Hash',
  fixtureName: 'vuejs.hash',
  urlPath: 'vuejs/index_hash.html',
});
