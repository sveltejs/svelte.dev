import { defineCollection, scopesFor } from 'airspace';
import { playground } from './lexicons.js';

export const playgrounds = defineCollection(playground, { sort: [['updatedAt', 'desc']] });

export const collections = { playgrounds };

export const SCOPES = scopesFor({ collections });
