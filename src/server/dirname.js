import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
export const __dirname = dirname(path.join(fileURLToPath(import.meta.url), '..', '..'));
