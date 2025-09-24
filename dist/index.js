'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createClient = require('openapi-fetch');

class LunchMoneyError extends Error {
    constructor(message, status, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data, errors) {
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
        const { apiKey, baseUrl = "https://dev.lunchmoney.app/v2" } = options;
        this.client = createClient({
            baseUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
    }
    handleResponse(response) {
        if (response.error) {
            const errorData = response.error;
            const message = errorData.message || "API request failed";
            const errors = errorData.errors || [];
            throw new LunchMoneyError(message, response.response.status, response.error, errors);
        }
        if (!response.data) {
            throw new LunchMoneyError("No data returned from API", response.response.status);
        }
        return response.data;
    }
    get user() {
        return {
            /**
             * Get current user information
             */
            getMe: async () => {
                const response = await this.client.GET("/me");
                return this.handleResponse(response);
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
                const data = this.handleResponse(response);
                return data.categories || [];
            },
            /**
             * Get a specific category by ID
             */
            get: async (id) => {
                const response = await this.client.GET("/categories/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
            /**
             * Create a new category
             */
            create: async (data) => {
                const response = await this.client.POST("/categories", { body: data });
                return this.handleResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/categories/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleResponse(response);
            },
            delete: async (id) => {
                const response = await this.client.DELETE("/categories/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get transactions() {
        return {
            getAll: async (params) => {
                const response = await this.client.GET("/transactions", {
                    params: { query: params },
                });
                const data = this.handleResponse(response);
                return data.transactions || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/transactions/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
            create: async (data) => {
                const response = await this.client.POST("/transactions", {
                    body: data,
                });
                return this.handleResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/transactions/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleResponse(response);
            },
            delete: async (id) => {
                const response = await this.client.DELETE("/transactions/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
            updateMany: async (data) => {
                const response = await this.client.PUT("/transactions", { body: data });
                return this.handleResponse(response);
            },
            split: async (id, data) => {
                const response = await this.client.POST("/transactions/split/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleResponse(response);
            },
            unsplit: async (id) => {
                const response = await this.client.DELETE("/transactions/split/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
            group: async (data) => {
                const response = await this.client.POST("/transactions/group", {
                    body: data,
                });
                return this.handleResponse(response);
            },
            ungroup: async (id) => {
                const response = await this.client.DELETE("/transactions/group/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get accounts() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/manual_accounts");
                const data = this.handleResponse(response);
                return data.manual_accounts || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/manual_accounts/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get plaidAccounts() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/plaid_accounts");
                const data = this.handleResponse(response);
                return data.plaid_accounts || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/plaid_accounts/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get tags() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/tags");
                const data = this.handleResponse(response);
                return data.tags || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/tags/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
            create: async (data) => {
                const response = await this.client.POST("/tags", { body: data });
                return this.handleResponse(response);
            },
            update: async (id, data) => {
                const response = await this.client.PUT("/tags/{id}", {
                    params: { path: { id } },
                    body: data,
                });
                return this.handleResponse(response);
            },
            delete: async (id) => {
                const response = await this.client.DELETE("/tags/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get recurringItems() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/recurring_items");
                const data = this.handleResponse(response);
                return data.recurring_items || [];
            },
            get: async (id) => {
                const response = await this.client.GET("/recurring_items/{id}", {
                    params: { path: { id } },
                });
                return this.handleResponse(response);
            },
        };
    }
    get summary() {
        return {
            get: async (params) => {
                const response = await this.client.GET("/summary", {
                    params: { query: params },
                });
                return this.handleResponse(response);
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
