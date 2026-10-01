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
        const { apiKey, baseUrl = "https://api.lunchmoney.dev/v2", headers: customHeaders, ...rest } = options;
        const headers = {
            "Content-Type": "application/json",
            ...customHeaders,
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
        const { message, errors } = this.normalizeErrorPayload(response.error);
        throw new LunchMoneyError(message, response.response.status, response.error, errors);
    }
    isRecord(value) {
        return typeof value === "object" && value !== null;
    }
    isErrorDetailArray(value) {
        return (Array.isArray(value) &&
            value.every((item) => this.isRecord(item) && typeof item.errMsg === "string"));
    }
    normalizeErrorPayload(error) {
        if (!this.isRecord(error)) {
            return { message: "API request failed", errors: [] };
        }
        const message = typeof error.message === "string" ? error.message : undefined;
        if (this.isErrorDetailArray(error.errors)) {
            return {
                message: message || "API request failed",
                errors: error.errors,
            };
        }
        if (typeof error.errMsg === "string") {
            const detailFields = { ...error };
            delete detailFields.message;
            return {
                message: message || error.errMsg,
                errors: [{ ...detailFields, errMsg: error.errMsg }],
            };
        }
        return {
            message: message || "API request failed",
            errors: [],
        };
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
            /**
             * Get settings for the current budgeting account, shared by all users
             * of the account
             */
            getAccountSettings: async () => {
                const response = await this.client.GET("/me/account/settings");
                return this.handleDataResponse(response);
            },
            /**
             * Update settings for the current budgeting account. Only the provided
             * properties are updated (at least one is required); returns the
             * complete updated settings.
             */
            updateAccountSettings: async (data) => {
                const response = await this.client.PUT("/me/account/settings", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            /**
             * Get settings specific to the current user within the current
             * budgeting account
             */
            getUserAccountSettings: async () => {
                const response = await this.client.GET("/me/user/account/settings");
                return this.handleDataResponse(response);
            },
            /**
             * Update settings specific to the current user within the current
             * budgeting account. Only the provided properties are updated (at least
             * one is required); returns the complete updated settings.
             */
            updateUserAccountSettings: async (data) => {
                const response = await this.client.PUT("/me/user/account/settings", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            /**
             * Get display and formatting settings for the current user across all
             * budgeting accounts
             */
            getUserSettings: async () => {
                const response = await this.client.GET("/me/user/settings");
                return this.handleDataResponse(response);
            },
            /**
             * Update display and formatting settings for the current user across all
             * budgeting accounts. Only the provided properties are updated (at least
             * one is required); returns the complete updated settings.
             * `show_debits_as_negative` only affects how the Lunch Money apps
             * display amounts; API amounts always return debits as positive.
             */
            updateUserSettings: async (data) => {
                const response = await this.client.PUT("/me/user/settings", {
                    body: data,
                });
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
            deleteMany: async (data) => {
                const response = await this.client.DELETE("/transactions", {
                    body: data,
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
            attachFile: async (transactionId, data) => {
                const response = await this.client.POST("/transactions/{transaction_id}/attachments", {
                    params: { path: { transaction_id: transactionId } },
                    body: data,
                });
                return this.handleDataResponse(response);
            },
            getAttachmentUrl: async (fileId) => {
                const response = await this.client.GET("/transactions/attachments/{file_id}", {
                    params: { path: { file_id: fileId } },
                });
                return this.handleDataResponse(response);
            },
            deleteAttachment: async (fileId) => {
                const response = await this.client.DELETE("/transactions/attachments/{file_id}", {
                    params: { path: { file_id: fileId } },
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
    get cryptocurrencies() {
        return {
            getAll: async () => {
                const response = await this.client.GET("/cryptocurrencies");
                const data = this.handleDataResponse(response);
                return data.cryptocurrencies || [];
            },
            create: async (data) => {
                const response = await this.client.POST("/cryptocurrencies", {
                    body: data,
                });
                return this.handleDataResponse(response);
            },
        };
    }
    get crypto() {
        return {
            manual: {
                getAll: async () => {
                    const response = await this.client.GET("/crypto/manual");
                    const data = this.handleDataResponse(response);
                    return data.crypto_manual || [];
                },
                get: async (id) => {
                    const response = await this.client.GET("/crypto/manual/{id}", {
                        params: { path: { id } },
                    });
                    return this.handleDataResponse(response);
                },
                create: async (data) => {
                    const response = await this.client.POST("/crypto/manual", {
                        body: data,
                    });
                    return this.handleDataResponse(response);
                },
                update: async (id, data) => {
                    const response = await this.client.PUT("/crypto/manual/{id}", {
                        params: { path: { id } },
                        body: data,
                    });
                    return this.handleDataResponse(response);
                },
                delete: async (id, params) => {
                    const response = await this.client.DELETE("/crypto/manual/{id}", {
                        params: { path: { id }, query: params },
                    });
                    return this.handleVoidResponse(response);
                },
            },
            synced: {
                getAll: async () => {
                    const response = await this.client.GET("/crypto/synced");
                    const data = this.handleDataResponse(response);
                    return data.crypto_synced || [];
                },
                get: async (id) => {
                    const response = await this.client.GET("/crypto/synced/{id}", {
                        params: { path: { id } },
                    });
                    return this.handleDataResponse(response);
                },
                getBalance: async (id, symbol) => {
                    const response = await this.client.GET("/crypto/synced/{id}/{symbol}", { params: { path: { id, symbol } } });
                    return this.handleDataResponse(response);
                },
                refresh: async (id) => {
                    const response = await this.client.POST("/crypto/synced/{id}/refresh", { params: { path: { id } } });
                    return this.handleDataResponse(response);
                },
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
    get budgets() {
        return {
            getSettings: async () => {
                const response = await this.client.GET("/budgets/settings");
                return this.handleDataResponse(response);
            },
            upsert: async (data) => {
                const response = await this.client.PUT("/budgets", { body: data });
                return this.handleDataResponse(response);
            },
            delete: async (params) => {
                const response = await this.client.DELETE("/budgets", {
                    params: { query: params },
                });
                return this.handleVoidResponse(response);
            },
        };
    }
    async balanceHistoryAccountGet(type, accountKey, query) {
        if (type === "crypto_synced") {
            if (typeof accountKey === "number") {
                throw new LunchMoneyError("crypto_synced balance history requires { id, symbol }", 0);
            }
            const response = await this.client.GET("/balance_history/crypto_synced/{account_id}/{symbol}", {
                params: {
                    path: {
                        account_id: accountKey.id,
                        symbol: accountKey.symbol,
                    },
                    query,
                },
            });
            const data = this.handleDataResponse(response);
            return data.balance_history ?? [];
        }
        const accountId = typeof accountKey === "number" ? accountKey : accountKey.id;
        const response = await this.client.GET("/balance_history/{account_type}/{account_id}", {
            params: {
                path: { account_type: type, account_id: accountId },
                query,
            },
        });
        const data = this.handleDataResponse(response);
        return data.balance_history ?? [];
    }
    async balanceHistoryAccountUpsert(type, accountKey, body) {
        if (type === "crypto_synced") {
            if (typeof accountKey === "number") {
                throw new LunchMoneyError("crypto_synced balance history requires { id, symbol }", 0);
            }
            const response = await this.client.PUT("/balance_history/crypto_synced/{account_id}/{symbol}", {
                params: {
                    path: {
                        account_id: accountKey.id,
                        symbol: accountKey.symbol,
                    },
                },
                body,
            });
            return this.handleDataResponse(response);
        }
        const accountId = typeof accountKey === "number" ? accountKey : accountKey.id;
        const response = await this.client.PUT("/balance_history/{account_type}/{account_id}", {
            params: {
                path: { account_type: type, account_id: accountId },
            },
            body,
        });
        return this.handleDataResponse(response);
    }
    async balanceHistoryAccountDelete(type, accountKey) {
        if (type === "crypto_synced") {
            if (typeof accountKey === "number") {
                throw new LunchMoneyError("crypto_synced balance history requires { id, symbol }", 0);
            }
            const response = await this.client.DELETE("/balance_history/crypto_synced/{account_id}/{symbol}", {
                params: {
                    path: {
                        account_id: accountKey.id,
                        symbol: accountKey.symbol,
                    },
                },
            });
            return this.handleVoidResponse(response);
        }
        const accountId = typeof accountKey === "number" ? accountKey : accountKey.id;
        const response = await this.client.DELETE("/balance_history/{account_type}/{account_id}", {
            params: {
                path: { account_type: type, account_id: accountId },
            },
        });
        return this.handleVoidResponse(response);
    }
    async balanceHistoryAccountUpdate(type, id, body) {
        const response = await this.client.PUT("/balance_history/deleted/{account_id}/details", {
            params: { path: { account_id: id } },
            body,
        });
        return this.handleDataResponse(response);
    }
    get balanceHistory() {
        return {
            getAll: async (params) => {
                const response = await this.client.GET("/balance_history", {
                    params: { query: params },
                });
                const data = this.handleDataResponse(response);
                return data.balance_history ?? [];
            },
            account: {
                get: this.balanceHistoryAccountGet.bind(this),
                upsert: this.balanceHistoryAccountUpsert.bind(this),
                delete: this.balanceHistoryAccountDelete.bind(this),
                update: this.balanceHistoryAccountUpdate.bind(this),
            },
            entry: {
                delete: async (id) => {
                    const response = await this.client.DELETE("/balance_history/entries/{id}", {
                        params: { path: { id } },
                    });
                    return this.handleVoidResponse(response);
                },
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
