/**
 * @jest-environment node
 */

const request = require("supertest");
const { createServer } = require("http");
const next = require("next");

// Configure Next.js for testing
const app = next({ dev: false });
const handle = app.getRequestHandler();

let server;
beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => handle(req, res)).listen(3001);
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

describe("GET /api/universities", () => {
  it("should return a list of universities with performance metrics", async () => {
    const response = await request(server).get(
      "/api/universities?country=Canada&name=University"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("responseTime");
  });
});
