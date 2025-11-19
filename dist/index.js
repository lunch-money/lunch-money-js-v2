'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createClient = require('openapi-fetch');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var createClient__default = /*#__PURE__*/_interopDefault(createClient);

class LunchMoneyError extends Error {
    constructor(message, status, data, errors) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = "LunchMoneyError";
        this.errors = errors || [];
    }
}

/**
 * Lunch Money API v2 client
 */
class LunchMoneyClient {
    constructor(options) {
        const { apiKey, baseUrl = "https://dev.lunchmoney.app/v2", ...rest } = options;
        const headers = {
            "Content-Type": "application/json",
        };
        if (apiKey) {
            headers.Authorization = `Bearer ${apiKey}`;
        }
        this.client = createClient__default.default({
            baseUrl,
            headers,
            ...rest,
        });
    }
    handleError(response) {
        const errorData = response.error;
        const message = errorData.message || "API request failed";
        const errors = errorData.errors || [];
        throw new LunchMoneyError(message, response.response.status, response.error, errors);
    }
    handleDataResponse(response) {
        if (response.error) {
            this.handleError(response);
        }
        if (response.data === undefined) {
            throw new LunchMoneyError("Expected data in response but received undefined", response.response.status);
        }
        return response.data;
    }
    handleVoidResponse(response) {
        if (response.error) {
            this.handleError(response);
        }
        // No data expected, just return void
    }
    get user() {
        return {
            /**
             * Get current user information
             */
            getMe: async () => {
                const response = await this.client.GET("/me");
                return this.handleDataResponse(response);
            },
        };
    }
    get categories() {
        return {
            /**
             * Get all categories
             */
            getAll: async (params) => {
                const response = await this.client.GET("/categories", {
                    params: { query: params },
                });
                const data = this.handleDataResponse(response);
                return data.categories || [];
            },
            /**
             * Get a specific category by ID
             */
            get: async (id) => {
                const response = await this.client.GET("/categories/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
            /**
             * Create a new category
             */
            create: async (data) => {
                const response = await this.client.POST("/categories", { body: data });
                return this.handleDataResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/categories/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            delete: async (id, params) => {
                const response = await this.client.DELETE("/categories/{id}", {
                    params: { path: { id }, query: params },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    get transactions() {
        return {
            getAll: async (params) => {
                const response = await this.client.GET("/transactions", {
                    params: { query: params },
                });
                const data = this.handleDataResponse(response);
                return {
                    transactions: data.transactions || [],
                    hasMore: data.has_more || false,
                };
            },
            get: async (id) => {
                const response = await this.client.GET("/transactions/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
            create: async (data) => {
                const response = await this.client.POST("/transactions", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/transactions/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            delete: async (id) => {
                const response = await this.client.DELETE("/transactions/{id}", {
                    params: { path: { id } },
                });
                return this.handleVoidResponse(response);
            },
            updateMany: async (data) => {
                const response = await this.client.PUT("/transactions", { body: data });
                return this.handleDataResponse(response);
            },
            split: async (id, data) => {
                const response = await this.client.POST("/transactions/split/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            unsplit: async (id) => {
                const response = await this.client.DELETE("/transactions/split/{id}", {
                    params: { path: { id } },
                });
                return this.handleVoidResponse(response);
            },
            group: async (data) => {
                const response = await this.client.POST("/transactions/group", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            ungroup: async (id) => {
                const response = await this.client.DELETE("/transactions/group/{id}", {
                    params: { path: { id } },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    get manualAccounts() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/manual_accounts");
                const data = this.handleDataResponse(response);
                return data.manual_accounts || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/manual_accounts/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
            create: async (data) => {
                const response = await this.client.POST("/manual_accounts", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/manual_accounts/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            delete: async (id) => {
                const response = await this.client.DELETE("/manual_accounts/{id}", {
                    params: { path: { id } },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    get plaidAccounts() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/plaid_accounts");
                const data = this.handleDataResponse(response);
                return data.plaid_accounts || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/plaid_accounts/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
            triggerFetch: async (params) => {
                const response = await this.client.POST("/plaid_accounts/fetch", {
                    params: { query: params },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    get tags() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/tags");
                const data = this.handleDataResponse(response);
                return data.tags || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/tags/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
            create: async (data) => {
                const response = await this.client.POST("/tags", { body: data });
                return this.handleDataResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/tags/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            delete: async (id, params) => {
                const response = await this.client.DELETE("/tags/{id}", {
                    params: { path: { id }, query: params },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    get recurringItems() {
        return {
            getAll: async (params) => {
                const response = await this.client.GET("/recurring_items", {
                    params: { query: params },
                });
                const data = this.handleDataResponse(response);
                return data.recurring_items || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/recurring_items/{id}", {
                    params: { path: { id } },
                });
                return this.handleDataResponse(response);
            },
        };
    }
    get summary() {
        return {
            get: async (params) => {
                const response = await this.client.GET("/summary", {
                    params: { query: params },
                });
                return this.handleDataResponse(response);
            },
        };
    }
    /**
     * Access to the raw openapi-fetch client for advanced usage
     */
    get rawClient() {
        return this.client;
    }
}

exports.LunchMoneyClient = LunchMoneyClient;
exports.LunchMoneyError = LunchMoneyError;
exports.default = LunchMoneyClient;
