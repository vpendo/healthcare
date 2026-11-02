import request from "supertest";
import app from "../app.js";

describe("Auth Endpoints", () => {
  it("should register a new patient successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Patient",
      email: "patient@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("patient@example.com");
  });

  it("should fail to login with wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});
