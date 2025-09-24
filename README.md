# Lunch Money JS v2

A TypeScript client library for the Lunch Money API v2, built with openapi-ts and openapi-fetch.

## Installation

```bash
npm install lunch-money-js-v2
```

## Usage

```typescript
import { LunchMoneyClient, LunchMoneyError, type ErrorResponse, type ErrorDetail, type User, type Category, type Transaction } from 'lunch-money-js-v2';

// Initialize the client
const client = new LunchMoneyClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://dev.lunchmoney.app/v2' // Optional
});

// Get current user
const userData: User = await client.user.getMe();
console.log(userData.name, userData.email);

// Get all categories
const categories: Category[] = await client.categories.getAll();
console.log(`Found ${categories.length} categories`);

// Get transactions with filters
const transactions: Transaction[] = await client.transactions.getAll({
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
console.log(`Found ${transactions.length} transactions`);

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

// Error handling - all methods throw LunchMoneyError on failure
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

// Access the raw openapi-fetch client for advanced usage (returns full response)
const rawResponse = await client.rawClient.GET('/me');
console.log(rawResponse.data, rawResponse.error, rawResponse.response);
```

## API Coverage

This library provides convenient methods for:

- **User**: Get current user details (`user.getMe()`)
- **Categories**: CRUD operations (`categories.getAll()`, `categories.get()`, `categories.create()`, `categories.update()`, `categories.delete()`)
- **Transactions**: Full transaction management (`transactions.getAll()`, `transactions.create()`, `transactions.split()`, `transactions.group()`)
- **Accounts**: Get manual account information (`accounts.getAll()`, `accounts.get()`)
- **Plaid Accounts**: Get Plaid-connected accounts (`plaidAccounts.getAll()`, `plaidAccounts.get()`)
- **Tags**: CRUD operations (`tags.getAll()`, `tags.create()`, `tags.update()`, `tags.delete()`)
- **Recurring Items**: Get recurring patterns (`recurringItems.getAll()`, `recurringItems.get()`)
- **Summary**: Get budget summaries (`summary.get()`)

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
  type RecurringItem,
  type TransactionAttachment,
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
  type CreateTransactionBody
} from 'lunch-money-js-v2';
```

For advanced usage, you can also import the raw OpenAPI types:

```typescript
import { type paths, type operations, type components } from 'lunch-money-js-v2';
```

## Development

```bash
# Install dependencies
npm install

# Generate types from OpenAPI spec
npm run generate-types

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

MIT