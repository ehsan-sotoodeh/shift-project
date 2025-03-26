// jest.setup.ts
import { Request, Response, Headers } from 'node-fetch';

// Polyfill globals expected by Next.js API routes
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
