import crypto from 'crypto';

Object.defineProperty(global.self, 'crypto', {
  value: {
    // webcrypto introduced in Node 15 is not yet available in types
    subtle: (crypto as any).webcrypto.subtle,
  },
});
