import { describe, expect, it } from 'vitest';
import { ContractCompilationError } from './contract-compilation-error';

describe('ContractCompilationError', () => {
  it('is an error carrying its message', () => {
    const error: ContractCompilationError = new ContractCompilationError(
      'deny rule matches its artifact',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('deny rule matches its artifact');
  });

  it('names itself so it survives serialization', () => {
    expect(new ContractCompilationError('x').name).toBe(
      'ContractCompilationError',
    );
  });
});
