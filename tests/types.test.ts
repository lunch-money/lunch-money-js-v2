import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

function assertCompiles(
	consumer: string,
	source: string,
	overrides: ts.CompilerOptions = {},
) {
	const filename = fileURLToPath(new URL(consumer, import.meta.url));
	const options: ts.CompilerOptions = {
		noEmit: true,
		strict: true,
		skipLibCheck: false,
		rootDir: fileURLToPath(new URL("..", import.meta.url)),
		target: ts.ScriptTarget.ES2020,
		module: ts.ModuleKind.NodeNext,
		moduleResolution: ts.ModuleResolutionKind.NodeNext,
		lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
		types: [],
		...overrides,
	};
	const host = ts.createCompilerHost(options);
	const getSourceFile = host.getSourceFile.bind(host);
	host.getSourceFile = (path, languageVersion, ...rest) =>
		path === filename
			? ts.createSourceFile(path, source, languageVersion, true)
			: getSourceFile(path, languageVersion, ...rest);
	const program = ts.createProgram([filename], options, host);
	const diagnostics = ts.getPreEmitDiagnostics(program);
	assert.equal(
		diagnostics.length,
		0,
		diagnostics
			.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))
			.join("\n"),
	);
}

test("ESM browser declarations accept binary inputs and spec queries", () => {
	const source = `
import { LunchMoneyClient, type AttachFileToTransactionBody, type UpdateTransactionParams,
  type DeleteManualAccountParams, type GetRecurringItemParams } from '@lunch-money/lunch-money-js-v2';
const client = new LunchMoneyClient({apiKey: 'test'});
const upload: AttachFileToTransactionBody = {file: new Blob(['receipt']), filename: 'receipt.txt', notes: ''};
client.transactions.attachFile(1, upload);
client.transactions.attachFile(1, {file: new File(['receipt'], 'receipt.txt')});
// @ts-expect-error String paths are not binary uploads
client.transactions.attachFile(1, {file: 'receipt.txt'});
const update: UpdateTransactionParams = {update_balance: false};
const deletion: DeleteManualAccountParams = {delete_items: true, delete_balance_history: false};
const recurring: GetRecurringItemParams = {start_date: '2026-01-01', end_date: '2026-01-31'};
client.transactions.update(1, {payee: 'Test'}, update);
client.manualAccounts.delete(1, deletion);
client.recurringItems.get(1, recurring);
client.transactions.update(1, {payee: 'Test'});
client.manualAccounts.delete(1);
client.recurringItems.get(1);
client.rawClient.GET('/me');
// @ts-expect-error rawClient still checks endpoint paths
client.rawClient.GET('/missing');
// @ts-expect-error update_balance must be boolean
client.transactions.update(1, {payee: 'Test'}, {update_balance: 'false'});
// @ts-expect-error delete_items must be boolean
client.manualAccounts.delete(1, {delete_items: 'true'});
// @ts-expect-error date filters must be strings
client.recurringItems.get(1, {start_date: 123});
`;
	assertCompiles("browser-consumer.mts", source);
});

for (const [name, lib] of [
	["with DOM types", ["lib.es2020.d.ts", "lib.dom.d.ts"]],
	["without DOM types", ["lib.es2020.d.ts"]],
] as const) {
	test(`Node binary declarations work ${name} without casts`, () => {
		assertCompiles(
			"node-consumer.mts",
			`
import { Blob, File } from 'node:buffer';
import { LunchMoneyClient, type TransactionAttachmentFile } from '@lunch-money/lunch-money-js-v2';
const client = new LunchMoneyClient({apiKey: 'test'});
const blob: TransactionAttachmentFile = new Blob(['receipt'], {type: 'image/png'});
const file: TransactionAttachmentFile = new File(['receipt'], 'receipt.png', {type: 'image/png'});
client.transactions.attachFile(1, {file: blob, filename: 'receipt.png'});
client.transactions.attachFile(1, {file});
`,
			{ types: ["node"], lib: [...lib] },
		);
	});
}

test("CommonJS declarations support Node16 require and named imports", () => {
	assertCompiles(
		"commonjs-consumer.cts",
		`
import sdk = require('@lunch-money/lunch-money-js-v2');
import { LunchMoneyClient, type AttachFileToTransactionBody } from '@lunch-money/lunch-money-js-v2';
const client = new sdk.LunchMoneyClient({apiKey: 'test'});
const namedClient = new LunchMoneyClient({apiKey: 'test'});
const defaultClient = new sdk.default({apiKey: 'test'});
const upload: AttachFileToTransactionBody = {file: new Blob(['receipt'])};
client.transactions.attachFile(1, upload);
namedClient.user.getMe();
defaultClient.user.getMe();
// @ts-expect-error CommonJS declarations still check query option types
client.transactions.update(1, {payee: 'Test'}, {update_balance: 'false'});
`,
		{
			module: ts.ModuleKind.Node16,
			moduleResolution: ts.ModuleResolutionKind.Node16,
		},
	);
});
