import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const SRC_DIR: string = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRYPOINT: string = 'cli.ts';

interface UnitDeclaration {
  readonly name: string;
  readonly typeOnly: boolean;
}

interface ProductionModule {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly baseName: string;
  readonly declarations: readonly UnitDeclaration[];
}

function listTypeScriptFiles(directory: string): readonly string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath: string = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTypeScriptFiles(entryPath));
    } else if (entry.name.endsWith('.ts')) {
      files.push(entryPath);
    }
  }
  return files;
}

function isProductionFile(path: string): boolean {
  return !path.endsWith('.spec.ts') && !path.endsWith('.d.ts');
}

function toKebabCase(identifier: string): string {
  return identifier
    .replace(/_/g, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function bindingName(name: ts.BindingName): string {
  return ts.isIdentifier(name) ? name.text : '<binding pattern>';
}

function declarationsOf(statement: ts.Statement): readonly UnitDeclaration[] {
  let declarations: readonly UnitDeclaration[] = [];
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    declarations = [
      { name: statement.name?.text ?? '<anonymous>', typeOnly: false },
    ];
  } else if (ts.isEnumDeclaration(statement)) {
    declarations = [{ name: statement.name.text, typeOnly: false }];
  } else if (ts.isModuleDeclaration(statement)) {
    declarations = [{ name: statement.name.text, typeOnly: false }];
  } else if (
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement)
  ) {
    declarations = [{ name: statement.name.text, typeOnly: true }];
  } else if (ts.isVariableStatement(statement)) {
    declarations = statement.declarationList.declarations.map(
      (declaration: ts.VariableDeclaration): UnitDeclaration => ({
        name: bindingName(declaration.name),
        typeOnly: false,
      }),
    );
  }
  return declarations;
}

function readModule(absolutePath: string): ProductionModule {
  const source: ts.SourceFile = ts.createSourceFile(
    absolutePath,
    readFileSync(absolutePath, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
  );
  const relativePath: string = relative(SRC_DIR, absolutePath)
    .split(sep)
    .join('/');
  return {
    absolutePath,
    relativePath,
    baseName: (relativePath.split('/').pop() ?? '').replace(/\.ts$/, ''),
    declarations: source.statements.flatMap(declarationsOf),
  };
}

function productionModules(): readonly ProductionModule[] {
  return listTypeScriptFiles(SRC_DIR)
    .filter(isProductionFile)
    .map(readModule)
    .sort((a: ProductionModule, b: ProductionModule): number =>
      a.relativePath.localeCompare(b.relativePath),
    );
}

function expectedDeclarationCount(module: ProductionModule): number {
  return module.relativePath === ENTRYPOINT ? 0 : 1;
}

function isBehaviorUnit(module: ProductionModule): boolean {
  return module.declarations.some(
    (declaration: UnitDeclaration): boolean => !declaration.typeOnly,
  );
}

function declaredNames(module: ProductionModule): string {
  return module.declarations
    .map((declaration: UnitDeclaration): string => declaration.name)
    .join(', ');
}

const MODULES: readonly ProductionModule[] = productionModules();

describe('one declaration per file', () => {
  it('holds exactly one top-level declaration per production file', () => {
    const offenders: readonly string[] = MODULES.filter(
      (module: ProductionModule): boolean =>
        module.declarations.length !== expectedDeclarationCount(module),
    ).map(
      (module: ProductionModule): string =>
        `src/${module.relativePath}: ${module.declarations.length} declarations` +
        ` (expected ${expectedDeclarationCount(module)}) — ${declaredNames(module)}`,
    );
    expect(offenders).toEqual([]);
  });

  it('names every production file after the declaration it holds', () => {
    const offenders: readonly string[] = MODULES.filter(
      (module: ProductionModule): boolean => module.declarations.length === 1,
    )
      .filter((module: ProductionModule): boolean => {
        const expected: string = toKebabCase(
          module.declarations[0]?.name ?? '',
        );
        return expected !== module.baseName;
      })
      .map(
        (module: ProductionModule): string =>
          `src/${module.relativePath}: expected ${toKebabCase(
            module.declarations[0]?.name ?? '',
          )}.ts for ${declaredNames(module)}`,
      );
    expect(offenders).toEqual([]);
  });

  it('pairs every behavior unit with a dedicated colocated spec', () => {
    const offenders: readonly string[] = MODULES.filter(isBehaviorUnit)
      .filter(
        (module: ProductionModule): boolean =>
          !existsSync(module.absolutePath.replace(/\.ts$/, '.spec.ts')),
      )
      .map(
        (module: ProductionModule): string =>
          `src/${module.relativePath}: missing ${module.baseName}.spec.ts`,
      );
    expect(offenders).toEqual([]);
  });
});
