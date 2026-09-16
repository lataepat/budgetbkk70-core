// Lossless transport for repeated labels and record fields. Amounts stay numbers.
export function packBudgetJson(input) {
  const strings = [], shapes = [];
  const stringIds = new Map(), shapeIds = new Map();
  const ancestors = new WeakSet();
  const visit = (value) => {
    if (typeof value === 'string') {
      if (!stringIds.has(value)) { stringIds.set(value, strings.length); strings.push(value); }
      return [stringIds.get(value)];
    }
    if (value && typeof value === 'object') {
      if (ancestors.has(value)) throw new TypeError('Cyclic values are not JSON data');
      const prototype = Object.getPrototypeOf(value);
      if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
        throw new TypeError('Only plain JSON objects and arrays are supported');
      }
      if (Reflect.ownKeys(value).some(key => typeof key === 'symbol')) {
        throw new TypeError('Symbol keys are not JSON data');
      }
      ancestors.add(value);
      if (Array.isArray(value)) {
        const values = [];
        for (let index = 0; index < value.length; index++) {
          if (!Object.hasOwn(value, index)) throw new TypeError('Sparse arrays are not JSON data');
          values.push(visit(value[index]));
        }
        ancestors.delete(value);
        return [null, ...values];
      }
      const keys = Object.keys(value), signature = JSON.stringify(keys);
      if (!shapeIds.has(signature)) { shapeIds.set(signature, shapes.length); shapes.push(keys); }
      const result = [false, shapeIds.get(signature), ...keys.map(key => visit(value[key]))];
      ancestors.delete(value);
      return result;
    }
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value === 0 ? 0 : value;
    throw new TypeError('Only JSON values with finite numbers are supported');
  };
  const root = visit(input);
  return { format: 'budget-packed-v1', strings, shapes, root };
}

export function unpackBudgetJson(packed) {
  if (packed?.format !== 'budget-packed-v1' || !Array.isArray(packed.strings) || !Array.isArray(packed.shapes)) throw new Error('Invalid budget data format');
  const { strings, shapes } = packed;
  if (!strings.every(value => typeof value === 'string') || !shapes.every(keys => Array.isArray(keys) && keys.every(key => typeof key === 'string') && new Set(keys).size === keys.length)) throw new Error('Invalid budget data dictionary');
  const visit = (value) => {
    if (!Array.isArray(value)) {
      if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
      throw new Error('Invalid budget data value');
    }
    if (value[0] === null) return value.slice(1).map(visit);
    if (value[0] === false) {
      const keys = Number.isInteger(value[1]) && value[1] >= 0 ? shapes[value[1]] : null;
      if (!keys || value.length !== keys.length + 2) throw new Error('Invalid budget record shape');
      return Object.fromEntries(keys.map((key, index) => [key, visit(value[index + 2])]));
    }
    if (value.length === 1 && Number.isInteger(value[0]) && value[0] >= 0 && value[0] < strings.length) return strings[value[0]];
    throw new Error('Invalid budget string reference');
  };
  return visit(packed.root);
}

export async function fetchBudgetJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('โหลดข้อมูลงบไม่สำเร็จ');
  return unpackBudgetJson(await response.json());
}
