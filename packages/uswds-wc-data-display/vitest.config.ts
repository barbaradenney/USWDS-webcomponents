/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { createTestConfig } from '../vitest.config.base.js';

export default defineConfig(createTestConfig(__dirname));
