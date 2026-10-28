// Regression net for the url sanitizer. Each row of the fixture is a url and the reviewed
// output of the default sanitizer. If a change alters any output, this fails; when the
// change is intended, review the diff and regenerate with WRITE_FIXTURES=1 npx jest <this file>.
import * as fs from 'fs';
import * as path from 'path';
import { createUrlSanitizer } from './utils';

const FIXTURE = path.join(
  __dirname,
  '__fixtures__/url_sanitization_corpus.json',
);

describe('url sanitization corpus', () => {
  const sanitize = createUrlSanitizer({ enabled: true })!;
  const rows: { url: string; sanitized: string }[] = JSON.parse(
    fs.readFileSync(FIXTURE, 'utf-8'),
  );

  test('every url gives its reviewed output', () => {
    const actual = rows.map(({ url }) => ({ url, sanitized: sanitize(url) }));
    if ('WRITE_FIXTURES' in process.env) {
      fs.writeFileSync(FIXTURE, JSON.stringify(actual, null, 2) + '\n');
    }
    expect(actual).toEqual(rows);
  });

  // a fixed pseudo-random generator, so every run checks the same urls
  const generateUrls = (count: number): string[] => {
    let seed = 42;
    const pick = <T>(items: T[]): T => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return items[seed % items.length];
    };
    const names = [
      'token',
      'page',
      'accessToken',
      'api-key',
      'id',
      'next',
      'user[password]',
      'TOKEN',
      'lang',
      'state',
    ];
    const values = [
      '1',
      'abc',
      'a%20b',
      'hello+world',
      '',
      '%2Fhome',
      'https%3A%2F%2Fb.com%2F%3Ftoken%3D1',
      '/home?tab=1',
      'a@b.com',
      '%E0%A4%A',
    ];
    const hosts = [
      'https://a.com',
      'https://u:p@a.com',
      'http://A.com:8080',
      '//cdn.a.com',
      '',
    ];
    const paths = ['/', '/x', '/a/b.js', ''];
    const fragments = [
      '',
      '#section',
      '#/route',
      '#/login?token=1&a=2',
      '#login?token=1',
      '#access_token=1&state=/d?x=1',
      '#!/x?sig=1',
    ];
    return Array.from({ length: count }, () => {
      const pairs = Array.from(
        { length: Number(pick(['0', '1', '2', '3'])) },
        () =>
          pick([true, false, false])
            ? pick(names)
            : `${pick(names)}=${pick(values)}`,
      );
      const query = pairs.length ? `?${pairs.join(pick(['&', '&', ';']))}` : '';
      return `${pick(hosts)}${pick(paths)}${query}${pick(fragments)}`;
    });
  };
  const generated = generateUrls(5000);

  test('sanitizing twice gives the same result as once', () => {
    for (const url of [...rows.map((r) => r.url), ...generated]) {
      const once = sanitize(url);
      expect(sanitize(once)).toBe(once);
    }
  });

  test('only values become REDACTED; everything else is kept byte for byte', () => {
    // A `user:pass@` login becomes `REDACTED:REDACTED@`; apart from that, splitting at
    // the separators the sanitizer works with must give the same pieces, except that a
    // piece may change from `name=<value>` to `name=REDACTED`. When that value was a
    // nested url, its own separators are swallowed with it, so the original has extra
    // pieces right after it.
    const LOGIN = /^((?:[a-z][a-z\d+.-]*:)?\/\/)[^/?#]*@/i;
    const pieces = (url: string) =>
      url.replace(LOGIN, '$1REDACTED:REDACTED@').split(/([?&;#])/);
    for (const url of generated) {
      const before = pieces(url);
      const after = pieces(sanitize(url));
      let i = 0;
      after.forEach((piece, k) => {
        if (piece !== before[i]) {
          const name = piece.slice(0, piece.indexOf('=') + 1);
          expect(name).not.toBe('');
          expect(piece).toBe(`${name}REDACTED`);
          expect(before[i].startsWith(name)).toBe(true);
          // skip original pieces until the next sanitized piece lines up again
          const next = after[k + 1];
          i++;
          if (next !== undefined) {
            while (i < before.length && before[i] !== next) i++;
          } else {
            i = before.length;
          }
          return;
        }
        i++;
      });
      expect(i).toBe(before.length);
    }
  });
});
