// Clean type exports from the OpenAPI schema
import type { components, operations } from "./types.generated";

// Main entity types
export type User = components["schemas"]["userObject"];
export type Category = components["schemas"]["categoryObject"];
export type ChildCategory = components["schemas"]["childCategoryObject"];
export type Transaction = components["schemas"]["transactionObject"];
export type ChildTransaction = components["schemas"]["childTransactionObject"];
export type InsertTransaction =
	components["schemas"]["insertTransactionObject"];
export type UpdateTransaction =
	components["schemas"]["updateTransactionObject"];
export type SplitTransaction = components["schemas"]["splitTransactionObject"];
export type ManualAccount = components["schemas"]["manualAccountObject"];
export type PlaidAccount = components["schemas"]["plaidAccountObject"];
export type Cryptocurrency = components["schemas"]["cryptoCurrencyObject"];
export type ManualCryptoAccount = components["schemas"]["cryptoManualObject"];
export type SyncedCryptoAccountBalance =
	components["schemas"]["cryptoSyncedBalance"];
export type SyncedCryptoAccount = components["schemas"]["syncedCryptoAccount"];
export type Tag = components["schemas"]["tagObject"];
export type RecurringItem = components["schemas"]["recurringObject"];
export type TransactionAttachment =
	components["schemas"]["transactionAttachmentObject"];
export type SkippedExistingExternalId =
	components["schemas"]["skippedExistingExternalIdObject"];
export type AccountSettings = components["schemas"]["accountSettingsObject"];
export type UserAccountSettings =
	components["schemas"]["userAccountSettingsObject"];
export type UserSettings = components["schemas"]["userSettingsObject"];

// Response types
export type InsertTransactionsResponse =
	components["schemas"]["insertTransactionsResponseObject"];
export type GetAllTransactionsResponse = {
	transactions: Transaction[];
	hasMore: boolean;
};
export type UpdateTransactionsResponse = {
	transactions: Transaction[];
};
export type ErrorResponse = components["schemas"]["errorResponseObject"];
export type AlignedSummaryResponse =
	components["schemas"]["summaryResponseObject"];
export type NonAlignedSummaryResponse =
	components["schemas"]["summaryResponseObject"];
export type DeleteCategoryResponse =
	components["schemas"]["deleteCategoryResponseWithDependencies"];
export type DeleteTagResponse =
	components["schemas"]["deleteTagResponseWithDependencies"];
export type BudgetSettingsResponse =
	components["schemas"]["budgetSettingsResponseObject"];
export type BudgetUpsertResponse =
	components["schemas"]["budgetUpsertResponseObject"];
export type BudgetInvalidPeriodError =
	components["schemas"]["budgetInvalidPeriodErrorObject"];

// Summary sub-types
export type SummaryTotals = components["schemas"]["summaryTotalsObject"];
export type SummaryTotalsBreakdown =
	components["schemas"]["summaryTotalsBreakdownObject"];
export type AlignedSummaryCategory =
	components["schemas"]["summaryCategoryObject"];
export type NonAlignedSummaryCategory =
	components["schemas"]["summaryCategoryObject"];
export type SummaryRolloverPoolAdjustment =
	components["schemas"]["summaryRolloverPoolAdjustmentObject"];
export type AlignedCategoryTotals =
	components["schemas"]["summaryCategoryTotalsObject"];
export type NonAlignedCategoryTotals =
	components["schemas"]["summaryCategoryTotalsObject"];
export type SummaryCategoryOccurrence =
	components["schemas"]["summaryCategoryOccurrenceObject"];
export type SummaryRecurringTransaction =
	components["schemas"]["summaryRecurringTransactionObject"];
export type SummaryRolloverPool =
	components["schemas"]["summaryRolloverPoolObject"];

// Error detail type from error response
export type ErrorDetail = ErrorResponse["errors"][number];

// Enums
export type Currency = components["schemas"]["currencyEnum"];
export type AccountType = components["schemas"]["accountTypeEnum"];
export type Locale = components["schemas"]["localeEnum"];
export type WeekStartsOn = components["schemas"]["weekStartsOnEnum"];
export type MonthYearFormat = components["schemas"]["monthYearFormatEnum"];
export type MonthDayYearFormat =
	components["schemas"]["monthDayYearFormatEnum"];
export type MonthDayFormat = components["schemas"]["monthDayFormatEnum"];

// API operation parameter and body types
export type GetAllCategoriesParams =
	operations["getAllCategories"]["parameters"]["query"];
export type CreateCategoryBody =
	operations["createCategory"]["requestBody"]["content"]["application/json"];
export type UpdateCategoryBody =
	operations["updateCategory"]["requestBody"]["content"]["application/json"];
export type GetAllTransactionsParams =
	operations["getAllTransactions"]["parameters"]["query"];
export type CreateTransactionsBody =
	operations["createNewTransactions"]["requestBody"]["content"]["application/json"];
export type UpdateTransactionBody =
	operations["updateTransaction"]["requestBody"]["content"]["application/json"];
export type UpdateTransactionsBody =
	operations["updateTransactions"]["requestBody"]["content"]["application/json"];
export type SplitTransactionBody =
	operations["splitTransaction"]["requestBody"]["content"]["application/json"];
export type GroupTransactionsBody =
	operations["groupTransactions"]["requestBody"]["content"]["application/json"];
export type CreateTagBody =
	operations["createTag"]["requestBody"]["content"]["application/json"];
export type UpdateTagBody =
	operations["updateTag"]["requestBody"]["content"]["application/json"];
export type GetBudgetSummaryParams =
	operations["getBudgetSummary"]["parameters"]["query"];
export type UpsertBudgetBody =
	operations["upsertBudget"]["requestBody"]["content"]["application/json"];
export type DeleteBudgetParams =
	operations["deleteBudget"]["parameters"]["query"];
export type GetAllRecurringItemsParams =
	operations["getAllRecurring"]["parameters"]["query"];
export type DeleteCategoryParams =
	operations["deleteCategory"]["parameters"]["query"];
export type DeleteTagParams = operations["deleteTag"]["parameters"]["query"];
export type CreateManualAccountBody =
	operations["createManualAccount"]["requestBody"]["content"]["application/json"];
export type UpdateManualAccountBody =
	operations["updateManualAccount"]["requestBody"]["content"]["application/json"];
export type CreateCryptocurrencyBody =
	operations["createCryptocurrency"]["requestBody"]["content"]["application/json"];
export type CreateManualCryptoAccountBody =
	operations["createCryptoManual"]["requestBody"]["content"]["application/json"];
export type UpdateManualCryptoAccountBody =
	operations["updateCryptoManual"]["requestBody"]["content"]["application/json"];
export type DeleteManualCryptoAccountParams =
	operations["deleteCryptoManual"]["parameters"]["query"];
export type TriggerPlaidAccountFetchParams =
	operations["triggerPlaidAccountFetch"]["parameters"]["query"];
export type DeleteTransactionsBody =
	operations["deleteTransactions"]["requestBody"]["content"]["application/json"];
export type AttachFileToTransactionBody =
	operations["attachFileToTransaction"]["requestBody"]["content"]["multipart/form-data"];
export type TransactionAttachmentUrlResponse =
	operations["getTransactionAttachmentUrl"]["responses"]["200"]["content"]["application/json"];
export type UpdateAccountSettingsBody =
	operations["updateAccountSettings"]["requestBody"]["content"]["application/json"];
export type UpdateUserAccountSettingsBody =
	operations["updateUserAccountSettings"]["requestBody"]["content"]["application/json"];
export type UpdateUserSettingsBody =
	operations["updateUserSettings"]["requestBody"]["content"]["application/json"];

export type BalanceHistoryAccount =
	components["schemas"]["balanceHistoryAccountObject"];
export type BalanceHistoryEntry = components["schemas"]["balanceHistoryEntry"];
export type HistoricalBalanceHistoryEntry =
	components["schemas"]["historicalBalanceHistoryEntry"];
export type CurrentBalanceHistoryEntry =
	components["schemas"]["currentBalanceHistoryEntry"];
export type BalanceHistorySourceManual =
	components["schemas"]["balanceHistorySourceManual"];
export type BalanceHistorySourcePlaid =
	components["schemas"]["balanceHistorySourcePlaid"];
export type BalanceHistorySourceCryptoManual =
	components["schemas"]["balanceHistorySourceCryptoManual"];
export type BalanceHistorySourceCryptoSynced =
	components["schemas"]["balanceHistorySourceCryptoSynced"];
export type BalanceHistorySourceDeleted =
	components["schemas"]["balanceHistorySourceDeleted"];
export type BalanceHistorySource =
	| BalanceHistorySourceManual
	| BalanceHistorySourcePlaid
	| BalanceHistorySourceCryptoManual
	| BalanceHistorySourceCryptoSynced
	| BalanceHistorySourceDeleted;

export type GetBalanceHistoryParams =
	operations["getBalanceHistory"]["parameters"]["query"];
export type GetBalanceHistoryAccountQuery =
	operations["getBalanceHistoryForAccount"]["parameters"]["query"];
export type UpsertBalanceHistoryBody =
	operations["upsertBalanceHistoryForAccount"]["requestBody"]["content"]["application/json"];
export type UpdateBalanceHistoryDetailsBody =
	operations["updateBalanceHistoryDetails"]["requestBody"]["content"]["application/json"];
export type UpdateBalanceHistoryDetailsResponse =
	operations["updateBalanceHistoryDetails"]["responses"]["200"]["content"]["application/json"];

export type BalanceHistoryAccountType =
	| "manual"
	| "plaid"
	| "crypto_manual"
	| "crypto_synced"
	| "deleted";
export type BalanceHistoryAccountKey = number | { id: number; symbol: string };

export type BalanceHistoryAccountGetInput =
	| {
			type: "crypto_synced";
			account: { id: number; symbol: string };
			query?: GetBalanceHistoryAccountQuery;
	  }
	| {
			type: Exclude<BalanceHistoryAccountType, "crypto_synced">;
			account: number;
			query?: GetBalanceHistoryAccountQuery;
	  };

export type BalanceHistoryAccountUpsertInput =
	| {
			type: "crypto_synced";
			account: { id: number; symbol: string };
			body: UpsertBalanceHistoryBody;
	  }
	| {
			type: Exclude<BalanceHistoryAccountType, "crypto_synced">;
			account: number;
			body: UpsertBalanceHistoryBody;
	  };

export type BalanceHistoryAccountDeleteInput =
	| { type: "crypto_synced"; account: { id: number; symbol: string } }
	| {
			type: Exclude<BalanceHistoryAccountType, "crypto_synced">;
			account: number;
	  };

export type BalanceHistoryAccountUpdateInput = {
	type: "deleted";
	id: number;
	body: UpdateBalanceHistoryDetailsBody;
};

// Re-export the raw OpenAPI types for advanced usage
export type { paths, operations, components } from "./types.generated";
