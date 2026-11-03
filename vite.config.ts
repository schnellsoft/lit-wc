import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lit-wc/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        todoList: resolve(import.meta.dirname, 'todo-list.html'),
        repeatVsMap: resolve(import.meta.dirname, 'repeat-vs-map.html'),
      },
    },
  },
});
