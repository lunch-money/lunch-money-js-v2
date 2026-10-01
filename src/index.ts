import createClient, { type Client, type ClientOptions } from "openapi-fetch";
import type { paths } from "./types.generated";
import type {
	User,
	AccountSettings,
	UserAccountSettings,
	UserSettings,
	UpdateAccountSettingsBody,
	UpdateUserAccountSettingsBody,
	UpdateUserSettingsBody,
	Category,
	Transaction,
	Tag,
	ManualAccount,
	PlaidAccount,
	Cryptocurrency,
	ManualCryptoAccount,
	SyncedCryptoAccountBalance,
	SyncedCryptoAccount,
	RecurringItem,
	GetAllCategoriesParams,
	CreateCategoryBody,
	UpdateCategoryBody,
	GetAllTransactionsParams,
	GetAllTransactionsResponse,
	CreateTransactionsBody,
	UpdateTransactionBody,
	UpdateTransactionParams,
	UpdateTransactionsBody,
	SplitTransactionBody,
	GroupTransactionsBody,
	CreateTagBody,
	UpdateTagBody,
	GetBudgetSummaryParams,
	UpsertBudgetBody,
	DeleteBudgetParams,
	GetAllRecurringItemsParams,
	DeleteCategoryParams,
	DeleteTagParams,
	AlignedSummaryResponse,
	NonAlignedSummaryResponse,
	BudgetSettingsResponse,
	BudgetUpsertResponse,
	CreateManualAccountBody,
	UpdateManualAccountBody,
	DeleteManualAccountParams,
	GetRecurringItemParams,
	CreateCryptocurrencyBody,
	CreateManualCryptoAccountBody,
	UpdateManualCryptoAccountBody,
	DeleteManualCryptoAccountParams,
	TriggerPlaidAccountFetchParams,
	InsertTransactionsResponse,
	UpdateTransactionsResponse,
	DeleteTransactionsBody,
	AttachFileToTransactionBody,
	TransactionAttachment,
	TransactionAttachmentUrlResponse,
	BalanceHistoryAccount,
	BalanceHistoryAccountType,
	BalanceHistoryAccountKey,
	GetBalanceHistoryParams,
	GetBalanceHistoryAccountQuery,
	UpsertBalanceHistoryBody,
	UpdateBalanceHistoryDetailsBody,
	UpdateBalanceHistoryDetailsResponse,
} from "./types";
import { LunchMoneyError, type ErrorResponse } from "./errors";

export interface LunchMoneyClientOptions extends ClientOptions {
	apiKey?: string;
	baseUrl?: string;
}

export interface BalanceHistoryAccountNamespace {
	get(
		type: "crypto_synced",
		account: { id: number; symbol: string },
		query?: GetBalanceHistoryAccountQuery,
	): Promise<BalanceHistoryAccount[]>;
	get(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
		query?: GetBalanceHistoryAccountQuery,
	): Promise<BalanceHistoryAccount[]>;
	upsert(
		type: "crypto_synced",
		account: { id: number; symbol: string },
		body: UpsertBalanceHistoryBody,
	): Promise<BalanceHistoryAccount>;
	upsert(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
		body: UpsertBalanceHistoryBody,
	): Promise<BalanceHistoryAccount>;
	delete(
		type: "crypto_synced",
		account: { id: number; symbol: string },
	): Promise<void>;
	delete(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
	): Promise<void>;
	update(
		type: "deleted",
		id: number,
		body: UpdateBalanceHistoryDetailsBody,
	): Promise<UpdateBalanceHistoryDetailsResponse>;
}

/**
 * Lunch Money API v2 client
 */
export class LunchMoneyClient {
	private client: Client<paths>;

	constructor(options: LunchMoneyClientOptions) {
		const {
			apiKey,
			baseUrl = "https://api.lunchmoney.dev/v2",
			headers: customHeaders,
			...rest
		} = options;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(customHeaders as Record<string, string>),
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
		error?: unknown;
		response: { status: number };
	}): never {
		const { message, errors } = this.normalizeErrorPayload(response.error);
		throw new LunchMoneyError(
			message,
			response.response.status,
			response.error,
			errors,
		);
	}

	private isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === "object" && value !== null;
	}

	private isErrorDetailArray(value: unknown): value is ErrorResponse["errors"] {
		return (
			Array.isArray(value) &&
			value.every(
				(item) => this.isRecord(item) && typeof item.errMsg === "string",
			)
		);
	}

	private normalizeErrorPayload(error: unknown): {
		message: string;
		errors: ErrorResponse["errors"];
	} {
		if (!this.isRecord(error)) {
			return { message: "API request failed", errors: [] };
		}

		const message =
			typeof error.message === "string" ? error.message : undefined;

		if (this.isErrorDetailArray(error.errors)) {
			return {
				message: message || "API request failed",
				errors: error.errors,
			};
		}

		if (typeof error.errMsg === "string") {
			const detailFields: Record<string, unknown> = { ...error };
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

	private handleDataResponse<T>(response: {
		data?: T;
		error?: unknown;
		response: { status: number; ok: boolean };
	}): T {
		if (!response.response.ok) {
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
		error?: unknown;
		response: { status: number; ok: boolean };
	}): void {
		if (!response.response.ok) {
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
			/**
			 * Get settings for the current budgeting account, shared by all users
			 * of the account
			 */
			getAccountSettings: async (): Promise<AccountSettings> => {
				const response = await this.client.GET("/me/account/settings");
				return this.handleDataResponse(response);
			},
			/**
			 * Update settings for the current budgeting account. Only the provided
			 * properties are updated (at least one is required); returns the
			 * complete updated settings.
			 */
			updateAccountSettings: async (
				data: UpdateAccountSettingsBody,
			): Promise<AccountSettings> => {
				const response = await this.client.PUT("/me/account/settings", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			/**
			 * Get settings specific to the current user within the current
			 * budgeting account
			 */
			getUserAccountSettings: async (): Promise<UserAccountSettings> => {
				const response = await this.client.GET("/me/user/account/settings");
				return this.handleDataResponse(response);
			},
			/**
			 * Update settings specific to the current user within the current
			 * budgeting account. Only the provided properties are updated (at least
			 * one is required); returns the complete updated settings.
			 */
			updateUserAccountSettings: async (
				data: UpdateUserAccountSettingsBody,
			): Promise<UserAccountSettings> => {
				const response = await this.client.PUT("/me/user/account/settings", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			/**
			 * Get display and formatting settings for the current user across all
			 * budgeting accounts
			 */
			getUserSettings: async (): Promise<UserSettings> => {
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
			updateUserSettings: async (
				data: UpdateUserSettingsBody,
			): Promise<UserSettings> => {
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
			create: async (
				data: CreateTransactionsBody,
			): Promise<InsertTransactionsResponse> => {
				const response = await this.client.POST("/transactions", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			update: async (
				id: number,
				data: UpdateTransactionBody,
				params?: UpdateTransactionParams,
			): Promise<Transaction> => {
				const response = await this.client.PUT("/transactions/{id}", {
					params: { path: { id }, query: params },
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
			deleteMany: async (data: DeleteTransactionsBody): Promise<void> => {
				const response = await this.client.DELETE("/transactions", {
					body: data,
				});
				return this.handleVoidResponse(response);
			},
			updateMany: async (
				data: UpdateTransactionsBody,
			): Promise<UpdateTransactionsResponse> => {
				const response = await this.client.PUT("/transactions", { body: data });
				return this.handleDataResponse(response);
			},
			split: async (
				id: number,
				data: SplitTransactionBody,
			): Promise<Transaction> => {
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
			group: async (data: GroupTransactionsBody): Promise<Transaction> => {
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
			attachFile: async (
				transactionId: number,
				data: AttachFileToTransactionBody,
			): Promise<TransactionAttachment> => {
				const form = new FormData();
				// Node's Blob/File typings can lag the DOM library. FormData
				// accepts these binaries without requiring newer Blob methods.
				const file = data.file as Blob;
				if (data.filename !== undefined) {
					form.append("file", file, data.filename);
				} else if ("name" in data.file && typeof data.file.name === "string") {
					form.append("file", file, data.file.name);
				} else {
					form.append("file", file, "attachment");
				}
				if (data.notes !== undefined) form.append("notes", data.notes);
				const response = await this.client.POST(
					"/transactions/{transaction_id}/attachments",
					{
						params: { path: { transaction_id: transactionId } },
						// The generated schema represents binary data as a string;
						// the serializer supplies the actual multipart file bytes.
						body: { file: "", notes: data.notes },
						bodySerializer: () => form,
						headers: { "Content-Type": null },
					},
				);
				return this.handleDataResponse(response);
			},
			getAttachmentUrl: async (
				fileId: number,
			): Promise<TransactionAttachmentUrlResponse> => {
				const response = await this.client.GET(
					"/transactions/attachments/{file_id}",
					{
						params: { path: { file_id: fileId } },
					},
				);
				return this.handleDataResponse(response);
			},
			deleteAttachment: async (fileId: number): Promise<void> => {
				const response = await this.client.DELETE(
					"/transactions/attachments/{file_id}",
					{
						params: { path: { file_id: fileId } },
					},
				);
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
			create: async (data: CreateManualAccountBody): Promise<ManualAccount> => {
				const response = await this.client.POST("/manual_accounts", {
					body: data,
				});
				return this.handleDataResponse(response);
			},
			update: async (
				id: number,
				data: UpdateManualAccountBody,
			): Promise<ManualAccount> => {
				const response = await this.client.PUT("/manual_accounts/{id}", {
					params: { path: { id } },
					body: data,
				});
				return this.handleDataResponse(response);
			},
			delete: async (
				id: number,
				params?: DeleteManualAccountParams,
			): Promise<void> => {
				const response = await this.client.DELETE("/manual_accounts/{id}", {
					params: { path: { id }, query: params },
				});
				return this.handleVoidResponse(response);
			},
		};
	}

	get cryptocurrencies() {
		return {
			getAll: async (): Promise<Cryptocurrency[]> => {
				const response = await this.client.GET("/cryptocurrencies");
				const data = this.handleDataResponse(response);
				return data.cryptocurrencies || [];
			},
			create: async (
				data: CreateCryptocurrencyBody,
			): Promise<Cryptocurrency> => {
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
				getAll: async (): Promise<ManualCryptoAccount[]> => {
					const response = await this.client.GET("/crypto/manual");
					const data = this.handleDataResponse(response);
					return data.crypto_manual || [];
				},
				get: async (id: number): Promise<ManualCryptoAccount> => {
					const response = await this.client.GET("/crypto/manual/{id}", {
						params: { path: { id } },
					});
					return this.handleDataResponse(response);
				},
				create: async (
					data: CreateManualCryptoAccountBody,
				): Promise<ManualCryptoAccount> => {
					const response = await this.client.POST("/crypto/manual", {
						body: data,
					});
					return this.handleDataResponse(response);
				},
				update: async (
					id: number,
					data: UpdateManualCryptoAccountBody,
				): Promise<ManualCryptoAccount> => {
					const response = await this.client.PUT("/crypto/manual/{id}", {
						params: { path: { id } },
						body: data,
					});
					return this.handleDataResponse(response);
				},
				delete: async (
					id: number,
					params?: DeleteManualCryptoAccountParams,
				): Promise<void> => {
					const response = await this.client.DELETE("/crypto/manual/{id}", {
						params: { path: { id }, query: params },
					});
					return this.handleVoidResponse(response);
				},
			},
			synced: {
				getAll: async (): Promise<SyncedCryptoAccount[]> => {
					const response = await this.client.GET("/crypto/synced");
					const data = this.handleDataResponse(response);
					return data.crypto_synced || [];
				},
				get: async (id: number): Promise<SyncedCryptoAccount> => {
					const response = await this.client.GET("/crypto/synced/{id}", {
						params: { path: { id } },
					});
					return this.handleDataResponse(response);
				},
				getBalance: async (
					id: number,
					symbol: string,
				): Promise<SyncedCryptoAccountBalance> => {
					const response = await this.client.GET(
						"/crypto/synced/{id}/{symbol}",
						{ params: { path: { id, symbol } } },
					);
					return this.handleDataResponse(response);
				},
				refresh: async (id: number): Promise<SyncedCryptoAccount> => {
					const response = await this.client.POST(
						"/crypto/synced/{id}/refresh",
						{ params: { path: { id } } },
					);
					return this.handleDataResponse(response);
				},
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
			triggerFetch: async (
				params?: TriggerPlaidAccountFetchParams,
			): Promise<void> => {
				const response = await this.client.POST("/plaid_accounts/fetch", {
					params: { query: params },
				});
				return this.handleVoidResponse(response);
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
			get: async (
				id: number,
				params?: GetRecurringItemParams,
			): Promise<RecurringItem> => {
				const response = await this.client.GET("/recurring_items/{id}", {
					params: { path: { id }, query: params },
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

	get budgets() {
		return {
			getSettings: async (): Promise<BudgetSettingsResponse> => {
				const response = await this.client.GET("/budgets/settings");
				return this.handleDataResponse(response);
			},
			upsert: async (data: UpsertBudgetBody): Promise<BudgetUpsertResponse> => {
				const response = await this.client.PUT("/budgets", { body: data });
				return this.handleDataResponse(response);
			},
			delete: async (params: DeleteBudgetParams): Promise<void> => {
				const response = await this.client.DELETE("/budgets", {
					params: { query: params },
				});
				return this.handleVoidResponse(response);
			},
		};
	}

	private balanceHistoryAccountGet(
		type: "crypto_synced",
		account: { id: number; symbol: string },
		query?: GetBalanceHistoryAccountQuery,
	): Promise<BalanceHistoryAccount[]>;
	private balanceHistoryAccountGet(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
		query?: GetBalanceHistoryAccountQuery,
	): Promise<BalanceHistoryAccount[]>;
	private async balanceHistoryAccountGet(
		type: BalanceHistoryAccountType,
		accountKey: BalanceHistoryAccountKey,
		query?: GetBalanceHistoryAccountQuery,
	): Promise<BalanceHistoryAccount[]> {
		if (type === "crypto_synced") {
			if (typeof accountKey === "number") {
				throw new LunchMoneyError(
					"crypto_synced balance history requires { id, symbol }",
					0,
				);
			}
			const response = await this.client.GET(
				"/balance_history/crypto_synced/{account_id}/{symbol}",
				{
					params: {
						path: {
							account_id: accountKey.id,
							symbol: accountKey.symbol,
						},
						query,
					},
				},
			);
			const data = this.handleDataResponse(response);
			return data.balance_history ?? [];
		}

		const accountId =
			typeof accountKey === "number" ? accountKey : accountKey.id;
		const response = await this.client.GET(
			"/balance_history/{account_type}/{account_id}",
			{
				params: {
					path: { account_type: type, account_id: accountId },
					query,
				},
			},
		);
		const data = this.handleDataResponse(response);
		return data.balance_history ?? [];
	}

	private balanceHistoryAccountUpsert(
		type: "crypto_synced",
		account: { id: number; symbol: string },
		body: UpsertBalanceHistoryBody,
	): Promise<BalanceHistoryAccount>;
	private balanceHistoryAccountUpsert(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
		body: UpsertBalanceHistoryBody,
	): Promise<BalanceHistoryAccount>;
	private async balanceHistoryAccountUpsert(
		type: BalanceHistoryAccountType,
		accountKey: BalanceHistoryAccountKey,
		body: UpsertBalanceHistoryBody,
	): Promise<BalanceHistoryAccount> {
		if (type === "crypto_synced") {
			if (typeof accountKey === "number") {
				throw new LunchMoneyError(
					"crypto_synced balance history requires { id, symbol }",
					0,
				);
			}
			const response = await this.client.PUT(
				"/balance_history/crypto_synced/{account_id}/{symbol}",
				{
					params: {
						path: {
							account_id: accountKey.id,
							symbol: accountKey.symbol,
						},
					},
					body,
				},
			);
			return this.handleDataResponse(response);
		}

		const accountId =
			typeof accountKey === "number" ? accountKey : accountKey.id;
		const response = await this.client.PUT(
			"/balance_history/{account_type}/{account_id}",
			{
				params: {
					path: { account_type: type, account_id: accountId },
				},
				body,
			},
		);
		return this.handleDataResponse(response);
	}

	private balanceHistoryAccountDelete(
		type: "crypto_synced",
		account: { id: number; symbol: string },
	): Promise<void>;
	private balanceHistoryAccountDelete(
		type: Exclude<BalanceHistoryAccountType, "crypto_synced">,
		account: number,
	): Promise<void>;
	private async balanceHistoryAccountDelete(
		type: BalanceHistoryAccountType,
		accountKey: BalanceHistoryAccountKey,
	): Promise<void> {
		if (type === "crypto_synced") {
			if (typeof accountKey === "number") {
				throw new LunchMoneyError(
					"crypto_synced balance history requires { id, symbol }",
					0,
				);
			}
			const response = await this.client.DELETE(
				"/balance_history/crypto_synced/{account_id}/{symbol}",
				{
					params: {
						path: {
							account_id: accountKey.id,
							symbol: accountKey.symbol,
						},
					},
				},
			);
			return this.handleVoidResponse(response);
		}

		const accountId =
			typeof accountKey === "number" ? accountKey : accountKey.id;
		const response = await this.client.DELETE(
			"/balance_history/{account_type}/{account_id}",
			{
				params: {
					path: { account_type: type, account_id: accountId },
				},
			},
		);
		return this.handleVoidResponse(response);
	}

	private async balanceHistoryAccountUpdate(
		type: "deleted",
		id: number,
		body: UpdateBalanceHistoryDetailsBody,
	): Promise<UpdateBalanceHistoryDetailsResponse> {
		const response = await this.client.PUT(
			"/balance_history/deleted/{account_id}/details",
			{
				params: { path: { account_id: id } },
				body,
			},
		);
		return this.handleDataResponse(response);
	}

	get balanceHistory(): {
		getAll: (
			params?: GetBalanceHistoryParams,
		) => Promise<BalanceHistoryAccount[]>;
		account: BalanceHistoryAccountNamespace;
		entry: { delete: (id: number) => Promise<void> };
	} {
		return {
			getAll: async (
				params?: GetBalanceHistoryParams,
			): Promise<BalanceHistoryAccount[]> => {
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
				delete: async (id: number): Promise<void> => {
					const response = await this.client.DELETE(
						"/balance_history/entries/{id}",
						{
							params: { path: { id } },
						},
					);
					return this.handleVoidResponse(response);
				},
			},
		};
	}

	/**
	 * Access to the raw openapi-fetch client for advanced usage
	 */
	get rawClient(): Client<paths> {
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
