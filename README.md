# Lunch Money JS v2

[![npm version](https://img.shields.io/npm/v/lunch-money-js-v2.svg)](https://www.npmjs.com/package/lunch-money-js-v2)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A TypeScript client library for the Lunch Money API v2, built with openapi-ts and openapi-fetch.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Coverage](#api-coverage)
- [Error Handling](#error-handling)
- [Type Safety](#type-safety)
- [Available Types](#available-types)
- [Requirements](#requirements)
- [Documentation](#documentation)
- [Development](#development)
- [Support](#support)

## Installation

```bash
npm install @lunch-money/lunch-money-js-v2
# or
pnpm add @lunch-money/lunch-money-js-v2
# or
yarn add @lunch-money/lunch-money-js-v2
```

## Usage

```typescript
import { LunchMoneyClient, LunchMoneyError, type ErrorResponse, type ErrorDetail, type User, type Category, type Transaction } from 'lunch-money-js-v2';

// Initialize the client
const client = new LunchMoneyClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.lunchmoney.dev/v2' // Optional
});

// Get current user
const userData: User = await client.user.getMe();
console.log(userData.name, userData.email);

// Get all categories
const categories: Category[] = await client.categories.getAll();
console.log(`Found ${categories.length} categories`);

// Get transactions with filters
const transactionsResponse = await client.transactions.getAll({
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
console.log(`Found ${transactionsResponse.transactions.length} transactions`);

// Create a category with full type checking
const newCategory: Category = await client.categories.create({
  name: 'Groceries',
  description: 'Food and household items',
  is_income: false,
  exclude_from_budget: false,
  exclude_from_totals: false,
  archived: false,
  is_group: false,
  group_id: null
});
console.log(`Created category: ${newCategory.name}`);

// Get a specific category
const category: Category = await client.categories.get(123);
console.log(`Category: ${category.name}`);

// Update a category
const updatedCategory: Category = await client.categories.update(123, {
  name: 'Updated Groceries'
});

// Delete a category
await client.categories.delete(123);

// Get budget settings
const budgetSettings = await client.budgets.getSettings();
console.log(budgetSettings.budget_period_granularity);

// Upsert a budget
const budget = await client.budgets.upsert({
  start_date: '2025-01-01',
  category_id: 123,
  amount: 500,
  currency: 'usd',
  notes: 'Monthly groceries'
});
console.log(budget.amount, budget.currency);

// Delete a budget
await client.budgets.delete({
  category_id: 123,
  start_date: '2025-01-01'
});

// Access the raw openapi-fetch client for advanced usage (returns full response)
const rawResponse = await client.rawClient.GET('/me');
console.log(rawResponse.data, rawResponse.error, rawResponse.response);
```

## Configuration

The `LunchMoneyClient` constructor accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | (required) | Your Lunch Money API key. Get it from the [developers page](https://my.lunchmoney.app/developers). |
| `baseUrl` | `string` | `'https://api.lunchmoney.dev/v2'` | API base URL. Only change this if directed by Lunch Money. |

## API Coverage

This library provides convenient methods for:

- **User**: Get current user details (`user.getMe()`)
- **Categories**: CRUD operations (`categories.getAll()`, `categories.get()`, `categories.create()`, `categories.update()`, `categories.delete()`)
- **Transactions**: Full transaction management (`transactions.getAll()`, `transactions.create()`, `transactions.split()`, `transactions.group()`)
- **Manual Accounts**: CRUD operations (`manualAccounts.getAll()`, `manualAccounts.get()`, `manualAccounts.create()`, `manualAccounts.update()`, `manualAccounts.delete()`)
- **Cryptocurrencies**: Supported cryptocurrency lookup and creation (`cryptocurrencies.getAll()`, `cryptocurrencies.create()`)
- **Crypto**: Manual and synced crypto account operations (`crypto.manual.getAll()`, `crypto.manual.create()`, `crypto.synced.getAll()`, `crypto.synced.getBalance()`, `crypto.synced.refresh()`)
- **Plaid Accounts**: Get Plaid-connected accounts (`plaidAccounts.getAll()`, `plaidAccounts.get()`)
- **Tags**: CRUD operations (`tags.getAll()`, `tags.create()`, `tags.update()`, `tags.delete()`)
- **Recurring Items**: Get recurring patterns (`recurringItems.getAll()`, `recurringItems.get()`)
- **Summary**: Get budget summaries (`summary.get()`)
- **Budgets**: Manage budget settings and period budgets (`budgets.getSettings()`, `budgets.upsert()`, `budgets.delete()`)
- **Balance History**: Monthly balance history across account types (`balanceHistory.getAll()`, `balanceHistory.account.get()`, `balanceHistory.account.upsert()`, `balanceHistory.account.delete()`, `balanceHistory.account.update()` for deleted-source metadata, `balanceHistory.entry.delete()`). Date ranges and upserts use `YYYY-MM` month values; responses distinguish stored `historical` entries from ephemeral `current` entries.

## Error Handling

All methods throw `LunchMoneyError` on API failure. The error object provides detailed information:

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error message from the API |
| `status` | `number` | HTTP status code |
| `data` | `unknown` | Raw error response data |
| `errors` | `ErrorDetail[]` | Array of detailed error objects |

The client normalizes API error payloads so `error.errors` remains useful even when an endpoint returns a top-level `errMsg` instead of an `errors[]` array. The original payload is always available in `error.data`.

```typescript
import { LunchMoneyError } from 'lunch-money-js-v2';

try {
  await client.transactions.create({
    transactions: [{
      date: '2024-01-01',
      amount: 100,
      payee: 'Test',
      manual_account_id: 99999999 // Invalid account ID
    }]
  });
} catch (error) {
  if (error instanceof LunchMoneyError) {
    console.error(`API Error (${error.status}): ${error.message}`);

    // Access detailed error information
    if (error.errors.length > 0) {
      console.error('Detailed errors:');
      error.errors.forEach((detail, index) => {
        console.error(`${index + 1}. ${detail.errMsg}`);
      });
    }
  }
}
```

## Type Safety

All API responses and request parameters are fully typed using TypeScript types generated directly from the OpenAPI specification. The library uses:

- **Generated Types**: All types are automatically generated from the OpenAPI spec using `openapi-typescript`
- **Clean Type Exports**: Import clean types like `User`, `Category`, `Transaction` directly from the package
- **Request/Response Types**: All parameters and response types are inferred from the OpenAPI specification
- **Runtime Validation**: Uses `openapi-fetch` for runtime type checking and validation

## Available Types

You can import clean, well-named types directly:

```typescript
// Main entity types
import {
  type User,
  type Category,
  type Transaction,
  type Tag,
  type ManualAccount,
  type PlaidAccount,
  type Cryptocurrency,
  type ManualCryptoAccount,
  type SyncedCryptoAccount,
  type SyncedCryptoAccountBalance,
  type RecurringItem,
  type TransactionAttachment,
  type BalanceHistoryAccount,
  type BalanceHistoryEntry,
  type HistoricalBalanceHistoryEntry,
  type CurrentBalanceHistoryEntry,
} from 'lunch-money-js-v2';

// Response types
import {
  type InsertTransactionsResponse,
  type ErrorResponse,
  type AlignedSummaryResponse,
  type NonAlignedSummaryResponse,
} from 'lunch-money-js-v2';

// Enums
import {
  type Currency,
  type AccountType,
} from 'lunch-money-js-v2';

// API operation types (for request/response typing)
import {
  type CreateCategoryBody,
  type UpdateCategoryBody,
  type GetAllTransactionsParams,
  type CreateTransactionsBody,
  type CreateManualCryptoAccountBody,
  type UpdateManualCryptoAccountBody,
  type DeleteManualCryptoAccountParams,
  type BalanceHistoryAccountType,
  type BalanceHistoryAccountGetInput,
  type BalanceHistoryAccountUpsertInput,
  type BalanceHistoryAccountDeleteInput,
  type BalanceHistoryAccountUpdateInput,
  type UpsertBalanceHistoryBody,
  type UpdateBalanceHistoryDetailsBody,
} from 'lunch-money-js-v2';
```

For advanced usage, you can also import the raw OpenAPI types:

```typescript
import { type paths, type operations, type components } from 'lunch-money-js-v2';
```

## Requirements

- Node.js 18 or later (LTS versions recommended)
- TypeScript 4.9+ (if using TypeScript)

## Documentation

This library wraps the Lunch Money API v2, which is currently in open alpha and expected to reach general availability (GA) in early 2026.

- [Lunch Money API Documentation](https://lunchmoney.dev/)
- [Get your API key](https://my.lunchmoney.app/developers) from the Lunch Money app

## Support

- [GitHub Issues](https://github.com/lunch-money/lunch-money-js-v2/issues)
- [Discord Community](https://discord.gg/lunchmoney) - `#developer-api` channel
- [Lunch Money Support](https://lunchmoney.app)
