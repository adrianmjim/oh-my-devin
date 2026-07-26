import { describe, expect, it } from 'vitest';
import { renderEndSentinel } from './render-end-sentinel';

describe('renderEndSentinel', () => {
  it('renders an html comment for markdown', () => {
    expect(renderEndSentinel('markdown', 'rules')).toBe(
      '<!-- omd:end id=rules -->',
    );
  });

  it('renders a hash comment for yaml', () => {
    expect(renderEndSentinel('yaml', 'team-default')).toBe(
      '# omd:end id=team-default',
    );
  });

  it('renders a double-slash comment for a script', () => {
    expect(renderEndSentinel('script', 'hook-script')).toBe(
      '// omd:end id=hook-script',
    );
  });
});
