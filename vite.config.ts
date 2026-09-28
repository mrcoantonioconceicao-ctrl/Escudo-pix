import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { simulateSub8msPipeline, handleMcpRpcRequest } from './src/server/apiHandler';
import { analyzePixThreatWithGemini, generateCypherQueryWithGemini } from './src/server/geminiService';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk; });
        req.on('end', async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            if (req.url === '/api/simulate-engine') {
              const result = simulateSub8msPipeline(body);
              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            }

            if (req.url === '/api/analyze-transaction') {
              const report = await analyzePixThreatWithGemini(body.tx, body.nodes || [], body.edges || []);
              res.statusCode = 200;
              return res.end(JSON.stringify(report));
            }

            if (req.url === '/api/generate-cypher') {
              const cypher = await generateCypherQueryWithGemini(body.prompt || '');
              res.statusCode = 200;
              return res.end(JSON.stringify({ cypher }));
            }

            if (req.url === '/api/mcp/rpc') {
              const response = handleMcpRpcRequest(body);
              res.statusCode = 200;
              return res.end(JSON.stringify(response));
            }

            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message || 'Erro interno do servidor' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
