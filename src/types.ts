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
export type Tag = components["schemas"]["tagObject"];
export type RecurringItem = components["schemas"]["recurringObject"];
export type TransactionAttachment =
	components["schemas"]["transactionAttachmentObject"];

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
	components["schemas"]["alignedSummaryResponseObject"];
export type NonAlignedSummaryResponse =
	components["schemas"]["nonAlignedSummaryResponseObject"];

// Error detail type from error response
export type ErrorDetail = ErrorResponse["errors"][number];

// Enums
export type Currency = components["schemas"]["currencyEnum"];
export type AccountType = components["schemas"]["accountTypeEnum"];

// API operation parameter and body types
export type GetAllCategoriesParams =
	operations["getAllCategories"]["parameters"]["query"];
export type CreateCategoryBody =
	operations["createCategory"]["requestBody"]["content"]["application/json"];
export type UpdateCategoryBody =
	operations["updateCategory"]["requestBody"]["content"]["application/json"];
export type GetAllTransactionsParams =
	operations["getAllTransactions"]["parameters"]["query"];
export type CreateTransactionBody =
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
export type GetAllRecurringItemsParams =
	operations["getAllRecurring"]["parameters"]["query"];
export type DeleteCategoryParams =
	operations["deleteCategory"]["parameters"]["query"];
export type DeleteTagParams = operations["deleteTag"]["parameters"]["query"];
export type CreateManualAccountBody =
	operations["createManualAccount"]["requestBody"]["content"]["application/json"];
export type UpdateManualAccountBody =
	operations["updateManualAccount"]["requestBody"]["content"]["application/json"];
export type TriggerPlaidAccountFetchParams =
	operations["triggerPlaidAccountFetch"]["parameters"]["query"];

// Re-export the raw OpenAPI types for advanced usage
export type { paths, operations, components } from "./types.generated";
