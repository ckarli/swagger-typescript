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
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ],
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

  test("should generate useSuspenseQuery hooks when createSuspenseHooks is enabled", async () => {
    const {
      "services.ts": code,
      "hooks.ts": hooks,
      "types.ts": types,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        createSuspenseHooks: true,
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

    // Verify specific hooks are generated
    expect(hooks).toContain("export const useGetUsersId");
    expect(hooks).toContain("export const useGetProducts");
    expect(hooks).toContain("export const useGetProductsId");
    
    // Verify that ALL query endpoints use useSuspenseQuery when flag is enabled
    const usersGetByIdHookMatch = hooks.match(/export const useGetUsersId[\s\S]*?return useSuspenseQuery/);
    expect(usersGetByIdHookMatch).toBeTruthy();
    
    const productsGetAllHookMatch = hooks.match(/export const useGetProducts[\s\S]*?return useSuspenseQuery/);
    expect(productsGetAllHookMatch).toBeTruthy();

    const productsGetByIdHookMatch = hooks.match(/export const useGetProductsId[\s\S]*?return useSuspenseQuery/);
    expect(productsGetByIdHookMatch).toBeTruthy();

    // Verify types are generated
    expect(types).toContain("export interface User");
    expect(types).toContain("export interface Product");
    expect(types).toContain("export interface Order");

    // Snapshot test
    expect(hooks).toMatchSnapshot("useSuspenseQuery hooks");
  }, 10000);

  test("should generate correct types when createSuspenseHooks is enabled", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        createSuspenseHooks: true,
      },
      swaggerJson,
    );

    // Verify the type uses UseSuspenseQueryOptions
    expect(hooks).toContain("type SwaggerTypescriptUseQueryOptions");
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

  test("should handle POST methods configured as query with suspense", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        createSuspenseHooks: true,
        useQuery: ["postOrders"], // POST endpoint configured as query
      },
      swaggerJson,
    );

    // Verify suspense import exists
    expect(hooks).toContain("useSuspenseQuery");
    
    // Verify postOrders uses useSuspenseQuery (not mutation)
    const ordersHookMatch = hooks.match(/export const usePostOrders[\s\S]*?return useSuspenseQuery/);
    expect(ordersHookMatch).toBeTruthy();
  }, 10000);

  test("should generate useSuspenseInfiniteQuery for infinite queries with suspense flag", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        createSuspenseHooks: true,
        useInfiniteQuery: ["getProducts"],
      },
      swaggerJson,
    );

    // Verify useSuspenseInfiniteQuery is imported
    expect(hooks).toContain("useSuspenseInfiniteQuery");
    expect(hooks).toContain("UseSuspenseInfiniteQueryOptions");
    
    // Verify getProducts uses useSuspenseInfiniteQuery
    const productsHookMatch = hooks.match(/export const useGetProducts[\s\S]*?useSuspenseInfiniteQuery\(/);
    expect(productsHookMatch).toBeTruthy();
    
    // Verify it includes infinite query features (pagination helpers)
    expect(hooks).toContain("paginationFlattenData");
    expect(hooks).toContain("getTotal");
    expect(hooks).toContain("useHasMore");
    
    // Snapshot test
    expect(hooks).toMatchSnapshot("useSuspenseInfiniteQuery hooks");
  }, 10000);

  test("should support mixing regular and infinite queries with suspense", async () => {
    const {
      "hooks.ts": hooks,
    } = await generator(
      {
        url: "./__tests__/outputs/useSuspenseQuery/swagger.json",
        dir: "./__tests__/outputs/useSuspenseQuery",
        reactHooks: true,
        createSuspenseHooks: true,
        useInfiniteQuery: ["getProducts"],
      },
      swaggerJson,
    );

    // Verify both types of hooks are generated
    expect(hooks).toContain("useSuspenseInfiniteQuery");
    expect(hooks).toContain("useSuspenseQuery");
    
    // Verify getProducts uses useSuspenseInfiniteQuery (configured as infinite)
    const productsHookMatch = hooks.match(/export const useGetProducts[\s\S]*?useSuspenseInfiniteQuery\(/);
    expect(productsHookMatch).toBeTruthy();
    
    // Verify getUsersId uses useSuspenseQuery (regular query with suspense)
    const usersHookMatch = hooks.match(/export const useGetUsersId[\s\S]*?return useSuspenseQuery/);
    expect(usersHookMatch).toBeTruthy();
  }, 10000);
});
