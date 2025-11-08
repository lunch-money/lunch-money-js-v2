import createClient, { ClientOptions } from "openapi-fetch";
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
	GetAllTransactionsResponse,
	CreateTransactionBody,
	UpdateTransactionBody,
	UpdateTransactionsBody,
	SplitTransactionBody,
	GroupTransactionsBody,
	CreateTagBody,
	UpdateTagBody,
	GetBudgetSummaryParams,
	GetAllRecurringItemsParams,
	DeleteCategoryParams,
	DeleteTagParams,
	AlignedSummaryResponse,
	NonAlignedSummaryResponse,
} from "./types";
import { LunchMoneyError, type ErrorResponse } from "./errors";

export interface LunchMoneyClientOptions extends ClientOptions {
	apiKey?: string;
	baseUrl?: string;
}

/**
 * Lunch Money API v2 client
 */
export class LunchMoneyClient {
	private client: ReturnType<typeof createClient<paths>>;

	constructor(options: LunchMoneyClientOptions) {
		const {
			apiKey,
			baseUrl = "https://dev.lunchmoney.app/v2",
			...rest
		} = options;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (apiKey) {
			headers.Authorization = `Bearer ${apiKey}`;
		}

		this.client = createClient<paths>({
			baseUrl,
			headers,
			...rest,
		});
	}

	private handleError(response: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		error?: any;
		response: { status: number };
	}): never {
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

	private handleDataResponse<T>(response: {
		data?: T;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		error?: any;
		response: { status: number };
	}): T {
		if (response.error) {
			this.handleError(response);
		}
		if (response.data === undefined) {
			throw new LunchMoneyError(
				"Expected data in response but received undefined",
				response.response.status,
			);
		}
		return response.data;
	}

	private handleVoidResponse(response: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		error?: any;
		response: { status: number };
	}): void {
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
			getMe: async (): Promise<User> => {
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
			getAll: async (params?: GetAllCategoriesParams): Promise<Category[]> => {
				const response = await this.client.GET("/categories", {
					params: { query: params },
				});
				const data = this.handleDataResponse(response);
				return data.categories || [];
			},
			/**
			 * Get a specific category by ID
			 */
			get: async (id: number): Promise<Category> => {
				const response = await this.client.GET("/categories/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
			},
			/**
			 * Create a new category
			 */
			create: async (data: CreateCategoryBody): Promise<Category> => {
				const response = await this.client.POST("/categories", { body: data });
				return this.handleDataResponse(response);
			},
			update: async (
				id: number,
				data: UpdateCategoryBody,
			): Promise<Category> => {
				const response = await this.client.PUT("/categories/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleDataResponse(response);
			},
			delete: async (
				id: number,
				params?: DeleteCategoryParams,
			): Promise<void> => {
				const response = await this.client.DELETE("/categories/{id}", {
					params: { path: { id }, query: params },
				});
				return this.handleVoidResponse(response);
			},
		};
	}

	get transactions() {
		return {
			getAll: async (
				params?: GetAllTransactionsParams,
			): Promise<GetAllTransactionsResponse> => {
				const response = await this.client.GET("/transactions", {
					params: { query: params },
				});
				const data = this.handleDataResponse(response);
				return {
					transactions: data.transactions || [],
					hasMore: data.has_more || false,
				};
			},
			get: async (id: number): Promise<Transaction> => {
				const response = await this.client.GET("/transactions/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
			},
			create: async (data: CreateTransactionBody): Promise<any> => {
				const response = await this.client.POST("/transactions", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			update: async (
				id: number,
				data: UpdateTransactionBody,
			): Promise<Transaction> => {
				const response = await this.client.PUT("/transactions/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleDataResponse(response);
			},
			delete: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/{id}", {
					params: { path: { id } },
				});
				return this.handleVoidResponse(response);
			},
			updateMany: async (data: UpdateTransactionsBody): Promise<any> => {
				const response = await this.client.PUT("/transactions", { body: data });
				return this.handleDataResponse(response);
			},
			split: async (id: number, data: SplitTransactionBody): Promise<any> => {
				const response = await this.client.POST("/transactions/split/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleDataResponse(response);
			},
			unsplit: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/split/{id}", {
					params: { path: { id } },
				});
				return this.handleVoidResponse(response);
			},
			group: async (data: GroupTransactionsBody): Promise<any> => {
				const response = await this.client.POST("/transactions/group", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			ungroup: async (id: number): Promise<void> => {
				const response = await this.client.DELETE("/transactions/group/{id}", {
					params: { path: { id } },
				});
				return this.handleVoidResponse(response);
			},
		};
	}

	get manualAccounts() {
		return {
			getAll: async (): Promise<ManualAccount[]> => {
				const response = await this.client.GET("/manual_accounts");
				const data = this.handleDataResponse(response);
				return data.manual_accounts || [];
			},
			get: async (id: number): Promise<ManualAccount> => {
				const response = await this.client.GET("/manual_accounts/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
			},
		};
	}

	get plaidAccounts() {
		return {
			getAll: async (): Promise<PlaidAccount[]> => {
				const response = await this.client.GET("/plaid_accounts");
				const data = this.handleDataResponse(response);
				return data.plaid_accounts || [];
			},
			get: async (id: number): Promise<PlaidAccount> => {
				const response = await this.client.GET("/plaid_accounts/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
			},
		};
	}

	get tags() {
		return {
			getAll: async (): Promise<Tag[]> => {
				const response = await this.client.GET("/tags");
				const data = this.handleDataResponse(response);
				return data.tags || [];
			},
			get: async (id: number): Promise<Tag> => {
				const response = await this.client.GET("/tags/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
			},
			create: async (data: CreateTagBody): Promise<Tag> => {
				const response = await this.client.POST("/tags", { body: data });
				return this.handleDataResponse(response);
			},
			update: async (id: number, data: UpdateTagBody): Promise<Tag> => {
				const response = await this.client.PUT("/tags/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleDataResponse(response);
			},
			delete: async (id: number, params?: DeleteTagParams): Promise<void> => {
				const response = await this.client.DELETE("/tags/{id}", {
					params: { path: { id }, query: params },
				});
				return this.handleVoidResponse(response);
			},
		};
	}

	get recurringItems() {
		return {
			getAll: async (
				params?: GetAllRecurringItemsParams,
			): Promise<RecurringItem[]> => {
				const response = await this.client.GET("/recurring_items", {
					params: { query: params },
				});
				const data = this.handleDataResponse(response);
				return data.recurring_items || [];
			},
			get: async (id: number): Promise<RecurringItem> => {
				const response = await this.client.GET("/recurring_items/{id}", {
					params: { path: { id } },
				});
				return this.handleDataResponse(response);
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

export default LunchMoneyClient;
export * from "./types";
export {
	LunchMoneyError,
	type ErrorDetail,
	type ErrorResponse,
} from "./errors";
