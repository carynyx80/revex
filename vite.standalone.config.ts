import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({root:path.resolve('standalone'),plugins:[react()],server:{proxy:{'/api':{target:'http://127.0.0.1:8080',changeOrigin:false}}},build:{outDir:path.resolve('dist-web'),emptyOutDir:true},publicDir:path.resolve('public'),resolve:{dedupe:['react','react-dom']}});
