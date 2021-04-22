import { createHashChecksumAsync } from './hashcash';

describe('createHashChecksumAsync', () => {
  it('returns stable hashes', async () => {
    const result = await Promise.all([
      createHashChecksumAsync('seed1'),
      createHashChecksumAsync('seed2'),
      createHashChecksumAsync('seed1'),
      createHashChecksumAsync('seed2'),
      createHashChecksumAsync('seed3'),
    ]);
    expect(result).toEqual([144, 395, 144, 395, 179]);
  });
});
