import createClient from "openapi-fetch";
import type { paths } from "./types.generated";
import type {
	User,
	Category,
	Transaction,
	Tag,
	ManualAccount,
	PlaidAccount,
	RecurringItem,
	GetAllCategoriesParams,
	CreateCategoryBody,
	UpdateCategoryBody,
	GetAllTransactionsParams,
	CreateTransactionBody,
	UpdateTransactionBody,
	UpdateTransactionsBody,
	SplitTransactionBody,
	GroupTransactionsBody,
	CreateTagBody,
	UpdateTagBody,
	GetBudgetSummaryParams,
	AlignedSummaryResponse,
	NonAlignedSummaryResponse,
} from "./types";
import { LunchMoneyError, type ErrorResponse } from "./errors";

export interface LunchMoneyClientOptions {
	apiKey: string;
	baseUrl?: string;
}

/**
 * Lunch Money API v2 client
 */
export class LunchMoneyClient {
	private client: ReturnType<typeof createClient<paths>>;

	constructor(options: LunchMoneyClientOptions) {
		const { apiKey, baseUrl = "https://dev.lunchmoney.app/v2" } = options;

		this.client = createClient<paths>({
			baseUrl,
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
		});
	}

	private handleResponse<T>(response: {
		data?: T;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		error?: any;
		response: { status: number };
	}): T {
		if (response.error) {
			const errorData = response.error as ErrorResponse;
			const message = errorData.message || "API request failed";
			const errors = errorData.errors || [];
			throw new LunchMoneyError(
				message,
				response.response.status,
				response.error,
				errors,
			);
		}

		if (!response.data) {
			throw new LunchMoneyError(
				"No data returned from API",
				response.response.status,
			);
		}

		return response.data;
	}

	get user() {
		return {
			/**
			 * Get current user information
			 */
			getMe: async (): Promise<User> => {
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
			getAll: async (params?: GetAllCategoriesParams): Promise<Category[]> => {
				const response = await this.client.GET("/categories", {
					params: { query: params },
				});
				const data = this.handleResponse(response);
				return data.categories || [];
			},
			/**
			 * Get a specific category by ID
			 */
			get: async (id: number): Promise<Category> => {
				const response = await this.client.GET("/categories/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
			/**
			 * Create a new category
			 */
			create: async (data: CreateCategoryBody): Promise<Category> => {
				const response = await this.client.POST("/categories", { body: data });
				return this.handleResponse(response);
			},
			update: async (
				id: number,
				data: UpdateCategoryBody,
			): Promise<Category> => {
				const response = await this.client.PUT("/categories/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleResponse(response);
			},
			delete: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/categories/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get transactions() {
		return {
			getAll: async (
				params?: GetAllTransactionsParams,
			): Promise<Transaction[]> => {
				const response = await this.client.GET("/transactions", {
					params: { query: params },
				});
				const data = this.handleResponse(response);
				return data.transactions || [];
			},
			get: async (id: number): Promise<Transaction> => {
				const response = await this.client.GET("/transactions/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
			create: async (data: CreateTransactionBody): Promise<any> => {
				const response = await this.client.POST("/transactions", {
					body: data,
				});
				return this.handleResponse(response);
			},
			update: async (
				id: number,
				data: UpdateTransactionBody,
			): Promise<Transaction> => {
				const response = await this.client.PUT("/transactions/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleResponse(response);
			},
			delete: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
			updateMany: async (data: UpdateTransactionsBody): Promise<any> => {
				const response = await this.client.PUT("/transactions", { body: data });
				return this.handleResponse(response);
			},
			split: async (id: number, data: SplitTransactionBody): Promise<any> => {
				const response = await this.client.POST("/transactions/split/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleResponse(response);
			},
			unsplit: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/split/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
			group: async (data: GroupTransactionsBody): Promise<any> => {
				const response = await this.client.POST("/transactions/group", {
					body: data,
				});
				return this.handleResponse(response);
			},
			ungroup: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/group/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get manualAccounts() {
		return {
			getAll: async (): Promise<ManualAccount[]> => {
				const response = await this.client.GET("/manual_accounts");
				const data = this.handleResponse(response);
				return data.manual_accounts || [];
			},
			get: async (id: number): Promise<ManualAccount> => {
				const response = await this.client.GET("/manual_accounts/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get plaidAccounts() {
		return {
			getAll: async (): Promise<PlaidAccount[]> => {
				const response = await this.client.GET("/plaid_accounts");
				const data = this.handleResponse(response);
				return data.plaid_accounts || [];
			},
			get: async (id: number): Promise<PlaidAccount> => {
				const response = await this.client.GET("/plaid_accounts/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get tags() {
		return {
			getAll: async (): Promise<Tag[]> => {
				const response = await this.client.GET("/tags");
				const data = this.handleResponse(response);
				return data.tags || [];
			},
			get: async (id: number): Promise<Tag> => {
				const response = await this.client.GET("/tags/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
			create: async (data: CreateTagBody): Promise<Tag> => {
				const response = await this.client.POST("/tags", { body: data });
				return this.handleResponse(response);
			},
			update: async (id: number, data: UpdateTagBody): Promise<Tag> => {
				const response = await this.client.PUT("/tags/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleResponse(response);
			},
			delete: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/tags/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get recurringItems() {
		return {
			getAll: async (): Promise<RecurringItem[]> => {
				const response = await this.client.GET("/recurring_items");
				const data = this.handleResponse(response);
				return data.recurring_items || [];
			},
			get: async (id: number): Promise<RecurringItem> => {
				const response = await this.client.GET("/recurring_items/{id}", {
					params: { path: { id } },
				});
				return this.handleResponse(response);
			},
		};
	}

	get summary() {
		return {
			get: async (
				params: GetBudgetSummaryParams,
			): Promise<AlignedSummaryResponse | NonAlignedSummaryResponse> => {
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

export default LunchMoneyClient;
export * from "./types";
export {
	LunchMoneyError,
	type ErrorDetail,
	type ErrorResponse,
} from "./errors";
