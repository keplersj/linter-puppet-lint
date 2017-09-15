'use babel';

import * as path from 'path';

const cleanPath = path.join(__dirname, 'fixtures', 'test_clean.pp');
const errorsPath = path.join(__dirname, 'fixtures', 'test_errors.pp');

describe('The puppet-lint provider for Linter', () => {
  const { lint } = require('../lib/main.js').provideLinter();

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();

    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('linter-puppet-lint'),
        atom.packages.activatePackage('language-puppet'),
      ]));
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(cleanPath).then(editor => lint(editor)).then((messages) => {
        expect(messages.length).toBe(0);
      }));
  });

  it('handles messages from puppet-lint', () => {
    waitsForPromise(() =>
      atom.workspace.open(errorsPath).then(editor => lint(editor)).then((messages) => {
        expect(messages.length).toBe(2);

        expect(messages[0].severity).toBe('error');
        expect(messages[0].html).not.toBeDefined();
        expect(messages[0].excerpt).toBe('does_not::exist not in autoload module layout');
        expect(messages[0].location.file).toBe(errorsPath);
        expect(messages[0].location.position).toEqual([[0, 6], [0, 14]]);

        expect(messages[1].severity).toBe('warning');
        expect(messages[1].html).not.toBeDefined();
        expect(messages[1].excerpt).toBe('class not documented');
        expect(messages[1].location.file).toBe(errorsPath);
        expect(messages[1].location.position).toEqual([[0, 0], [0, 5]]);
      }));
  });
});
