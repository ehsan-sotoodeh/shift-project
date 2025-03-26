import { Request, Response, Headers } from 'node-fetch';

// Polyfill globals expected by Next.js API routes
(global as any).Request = Request;
(global as any).Response = Response;
(global as any).Headers = Headers;