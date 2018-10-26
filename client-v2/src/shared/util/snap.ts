import { getAbsolutePath } from './url';

function generateId() {
  return 'snap/' + new Date().getTime();
}
function validateId(id: string) {
  return ([] as Array<string|null>).concat(getAbsolutePath(id || '').match(/^snap\/\d+$/))[0] || undefined;
}

export { generateId, validateId };
