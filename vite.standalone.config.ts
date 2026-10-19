import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({root:path.resolve('standalone'),plugins:[react()],build:{outDir:path.resolve('dist-web'),emptyOutDir:true},publicDir:path.resolve('public'),resolve:{dedupe:['react','react-dom']}});
