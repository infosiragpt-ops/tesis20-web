import { sculptedHuman } from './sculpted-human.js';

// Retain the public child factory for integrations, with the new anatomy.
export const child = sculptedHuman;
export const nina = { id: 'nina', label: 'Sami', build: () => sculptedHuman({ coat: '#b46753', trousers: '#486588', girl: true }) };
export const nino = { id: 'nino', label: 'Tico', build: () => sculptedHuman({ coat: '#c6a260', trousers: '#344e6f', chullo: true }) };
export const nina2 = { id: 'nina2', label: 'Ana', build: () => sculptedHuman({ coat: '#e8dec6', trousers: '#427b83', girl: true, skinTone: '#c98a5e' }) };
export const maquinista = { id: 'maquinista', label: 'Maquinista', build: () => sculptedHuman({ coat: '#45658b', trousers: '#344458', sailor: true, adult: true, skinTone: '#a8734d' }) };
