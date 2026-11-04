import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FamCare Healthcare API",
      version: "1.0.0",
      description:
        "REST API for the FamCare healthcare platform. Covers authentication and will expand as more features are added.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the JWT token you received from /api/auth/login",
        },
      },
      schemas: {
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", example: "665f1a2b3c4d5e6f7a8b9c0d" },
            name: { type: "string", example: "Jane Doe" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            role: {
              type: "string",
              enum: ["patient", "receptionist", "doctor"],
              example: "patient",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-04T10:30:00.000Z",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/UserProfile" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation error." },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
              example: {
                email: ["Invalid email address."],
                password: ["Password must be at least 8 characters long."],
              },
            },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  // Point to the files that contain JSDoc @swagger annotations
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
