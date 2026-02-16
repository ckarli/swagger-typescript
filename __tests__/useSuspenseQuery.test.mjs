import { cleanOutputDir, generator } from "./main/utils.mjs";

const swaggerJson = {
  "openapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "paths": {
    "/users/{id}": {
      "get": {
        "tags": ["Users"],
        "operationId": "Users_GetById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    },
    "/products": {
      "get": {
        "tags": ["Products"],
        "operationId": "Products_GetAll",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Product"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/products/{id}": {
      "get": {
        "tags": ["Products"],
        "operationId": "Products_GetById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Product"
                }
              }
            }
          }
        }
      }
    },
    "/orders": {
      "post": {
        "tags": ["Orders"],
        "operationId": "Orders_Create",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateOrderInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          }
        }
      },
      "Product": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "price": {
            "type": "number"
          }
        }
      },
      "Order": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "productId": {
            "type": "string"
          }
        }
      },
      "CreateOrderInput": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string"
          },
          "productId": {
            "type": "string"
          }
        }
      }
    }
  }
};

describe("useSuspenseQuery", () => {
  beforeAll(async () => {
    await cleanOutputDir("./__tests__/outputs/useSuspenseQuery");
  });

  afterEach(async () => {
    await cleanOutputDir("./__tests__/outputs/useSuspenseQuery");
  });

  test("should generate useSuspenseQuery hooks for configured endpoints", async () => {
    const {
      "services.ts": code,
      "hooks.ts": hooks,
      "types.ts": types,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        useSuspenseQuery: ["getUsersId", "getProducts"],
      },
      swaggerJson,
    );

    // Verify services are generated
    expect(code).toContain("export const getUsersId");
    expect(code).toContain("export const getProducts");
    expect(code).toContain("export const getProductsId");
    expect(code).toContain("export const postOrders");

    // Verify hooks contain useSuspenseQuery import
    expect(hooks).toContain("useSuspenseQuery");
    expect(hooks).toContain("UseSuspenseQueryOptions");

    // Verify specific hooks use useSuspenseQuery
    expect(hooks).toContain("export const useGetUsersId");
    expect(hooks).toContain("export const useGetProducts");
    
    // Verify that the configured endpoints use useSuspenseQuery
    const usersGetByIdHookMatch = hooks.match(/export const useGetUsersId[\s\S]*?return useSuspenseQuery/);
    expect(usersGetByIdHookMatch).toBeTruthy();
    
    const productsGetAllHookMatch = hooks.match(/export const useGetProducts[\s\S]*?return useSuspenseQuery/);
    expect(productsGetAllHookMatch).toBeTruthy();

    // Verify that non-configured endpoints use useQuery
    const productsGetByIdHookMatch = hooks.match(/export const useGetProductsId[\s\S]*?return useQuery/);
    expect(productsGetByIdHookMatch).toBeTruthy();

    // Verify types are generated
    expect(types).toContain("export interface User");
    expect(types).toContain("export interface Product");
    expect(types).toContain("export interface Order");

    // Snapshot test
    expect(hooks).toMatchSnapshot("useSuspenseQuery hooks");
  }, 10000);

  test("should generate SwaggerTypescriptUseSuspenseQueryOptions type when useSuspenseQuery is configured", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        useSuspenseQuery: ["getUsersId"],
      },
      swaggerJson,
    );

    // Verify the type is generated
    expect(hooks).toContain("type SwaggerTypescriptUseSuspenseQueryOptions");
    expect(hooks).toContain("UseSuspenseQueryOptions<SwaggerResponse<");
  }, 10000);

  test("should not import useSuspenseQuery when not configured", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
      },
      swaggerJson,
    );

    // Verify useSuspenseQuery is not imported
    expect(hooks).not.toContain("useSuspenseQuery");
    expect(hooks).not.toContain("UseSuspenseQueryOptions");
    
    // Verify all hooks use useQuery instead
    expect(hooks).toContain("return useQuery");
  }, 10000);

  test("should handle both useQuery and useSuspenseQuery in same config", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        useSuspenseQuery: ["getUsersId"],
        useQuery: ["postOrders"], // POST endpoint configured as query
      },
      swaggerJson,
    );

    // Verify both imports exist
    expect(hooks).toContain("useQuery");
    expect(hooks).toContain("useSuspenseQuery");
    
    // Verify getUsersId uses useSuspenseQuery
    const usersHookMatch = hooks.match(/export const useGetUsersId[\s\S]*?return useSuspenseQuery/);
    expect(usersHookMatch).toBeTruthy();
    
    // Verify postOrders uses useQuery (not mutation)
    const ordersHookMatch = hooks.match(/export const usePostOrders[\s\S]*?return useQuery/);
    expect(ordersHookMatch).toBeTruthy();
  }, 10000);
});
