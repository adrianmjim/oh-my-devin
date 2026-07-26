import { describe, expect, it } from 'vitest';
import type { MergeStrategy } from '../layer/merge-strategy';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { mergeByStrategy } from './merge-by-strategy';
import type { MergeTarget } from './merge-target';

function target(strategy: MergeStrategy): MergeTarget {
  return {
    kind: 'merge',
    component: 'rules',
    absolutePath: '/tmp/omd/rules.md',
    reportPath: 'rules.md',
    strategy,
    framing: {
      id: 'rules',
      version: '1.2.3',
      style: 'markdown',
      content: 'body',
    },
  };
}

describe('mergeByStrategy', () => {
  it('creates a container file from its framing', () => {
    const outcome: MergeOutcome = mergeByStrategy(target('container'), null);

    expect(outcome.kind).toBe('created');
  });

  it('creates a unit file from its framing', () => {
    const outcome: MergeOutcome = mergeByStrategy(target('unit'), null);

    expect(outcome.kind).toBe('created');
  });

  it('routes a json-document target through the json merge', () => {
    const outcome: MergeOutcome = mergeByStrategy(
      {
        ...target('json-document'),
        framing: { ...target('json-document').framing, content: '{}' },
      },
      null,
    );

    expect(outcome.kind).toBe('created');
  });

  it('leaves an unchanged file unchanged', () => {
    const created: MergeOutcome = mergeByStrategy(target('unit'), null);
    const content: string = created.kind === 'created' ? created.content : '';

    expect(mergeByStrategy(target('unit'), content).kind).toBe('unchanged');
  });
});
