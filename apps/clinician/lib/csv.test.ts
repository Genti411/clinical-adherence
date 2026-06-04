import { toCsv } from './csv';

describe('toCsv', () => {
  it('returns empty string for empty array', () => {
    expect(toCsv([])).toBe('');
  });

  it('produces header + row for single record', () => {
    const result = toCsv([{ name: 'Alice', age: 30, active: true }]);
    expect(result).toBe('name,age,active\nAlice,30,true');
  });

  it('produces header + multiple rows', () => {
    const result = toCsv([
      { id: '1', score: 95 },
      { id: '2', score: 80 },
    ]);
    expect(result).toBe('id,score\n1,95\n2,80');
  });

  it('quotes values containing commas', () => {
    const result = toCsv([{ name: 'Smith, John', value: 1 }]);
    expect(result).toBe('name,value\n"Smith, John",1');
  });

  it('quotes values containing double-quotes and escapes them', () => {
    const result = toCsv([{ note: 'He said "hello"' }]);
    expect(result).toBe('note\n"He said ""hello"""');
  });

  it('quotes values containing newlines', () => {
    const result = toCsv([{ text: 'line1\nline2' }]);
    expect(result).toBe('text\n"line1\nline2"');
  });

  it('renders null as empty string', () => {
    const result = toCsv([{ a: null, b: 'x' }]);
    expect(result).toBe('a,b\n,x');
  });

  it('renders boolean false correctly', () => {
    const result = toCsv([{ completed: false }]);
    expect(result).toBe('completed\nfalse');
  });

  it('uses first row keys as column order', () => {
    const result = toCsv([{ z: 1, a: 2 }]);
    const [header] = result.split('\n');
    expect(header).toBe('z,a');
  });
});
