import assert from "node:assert/strict";
import { Blob as NodeBlob, File } from "node:buffer";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import {
	LunchMoneyClient,
	LunchMoneyError,
	type LunchMoneyClientOptions,
} from "@lunch-money/lunch-money-js-v2";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

function mockClient(
	respond: (request: Request) => Response | Promise<Response>,
	options: LunchMoneyClientOptions = {},
) {
	const requests: Request[] = [];
	const client = new LunchMoneyClient({
		...options,
		fetch: async (request) => {
			requests.push(request);
			return respond(request);
		},
	});
	return { client, requests };
}

function requestAt(requests: readonly Request[], index: number): Request {
	const request = requests[index];
	assert.ok(request, `Expected request at index ${index}`);
	return request;
}

test("both package entry points expose a working client", async () => {
	const require = createRequire(import.meta.url);
	const cjs: typeof import("@lunch-money/lunch-money-js-v2") = require("@lunch-money/lunch-money-js-v2");
	assert.equal(typeof cjs.LunchMoneyClient, "function");
	assert.equal(cjs.default, cjs.LunchMoneyClient);
	for (const Client of [LunchMoneyClient, cjs.LunchMoneyClient]) {
		const client = new Client({ fetch: async () => json({ id: 1 }) });
		assert.deepEqual(await client.user.getMe(), { id: 1 });
	}
});

test("every generated spec operation has a wrapper", () => {
	const generated = ts.createSourceFile(
		"types.generated.ts",
		readFileSync(new URL("../src/types.generated.ts", import.meta.url), "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const paths = generated.statements.find(
		(node) => ts.isInterfaceDeclaration(node) && node.name.text === "paths",
	);
	assert.ok(paths && ts.isInterfaceDeclaration(paths));
	const operations = paths.members.flatMap((path) => {
		assert.ok(
			ts.isPropertySignature(path) &&
				path.type &&
				ts.isTypeLiteralNode(path.type),
		);
		assert.ok(ts.isStringLiteral(path.name));
		const pathName = path.name.text;
		return path.type.members.flatMap((method) => {
			if (
				!ts.isPropertySignature(method) ||
				!method.type ||
				!ts.isIndexedAccessTypeNode(method.type)
			)
				return [];
			return [`${method.name.getText(generated).toUpperCase()} ${pathName}`];
		});
	});
	const source = readFileSync(
		new URL("../src/index.ts", import.meta.url),
		"utf8",
	);
	const wrappers = [
		...source.matchAll(
			/this\.client\.(GET|POST|PUT|PATCH|DELETE)\(\s*"([^"]+)"/g,
		),
	].map((match) => `${match[1]} ${match[2]}`);
	assert.equal(operations.length, 65);
	assert.deepEqual(wrappers.sort(), operations.sort());
});

for (const { get, update, path, settings, read, write } of [
	{
		get: "getAccountSettings",
		update: "updateAccountSettings",
		path: "/me/account/settings",
		settings: { display_name: "Family" },
		read: (client: LunchMoneyClient) => client.user.getAccountSettings(),
		write: (client: LunchMoneyClient) =>
			client.user.updateAccountSettings({ display_name: "Family" }),
	},
	{
		get: "getUserAccountSettings",
		update: "updateUserAccountSettings",
		path: "/me/user/account/settings",
		settings: { default_manual_account_id: null },
		read: (client: LunchMoneyClient) => client.user.getUserAccountSettings(),
		write: (client: LunchMoneyClient) =>
			client.user.updateUserAccountSettings({
				default_manual_account_id: null,
			}),
	},
	{
		get: "getUserSettings",
		update: "updateUserSettings",
		path: "/me/user/settings",
		settings: { show_debits_as_negative: false },
		read: (client: LunchMoneyClient) => client.user.getUserSettings(),
		write: (client: LunchMoneyClient) =>
			client.user.updateUserSettings({ show_debits_as_negative: false }),
	},
]) {
	test(`${get} and ${update} use the settings contract`, async () => {
		const { client, requests } = mockClient(() => json(settings));
		assert.deepEqual(await read(client), settings);
		assert.deepEqual(await write(client), settings);
		assert.deepEqual(
			requests.map((r) => [r.method, new URL(r.url).pathname]),
			[
				["GET", `/v2${path}`],
				["PUT", `/v2${path}`],
			],
		);
		assert.deepEqual(await requestAt(requests, 1).json(), settings);
	});
}

for (const [name, file, filename, expectedName, notes] of [
	[
		"Blob with explicit filename",
		new Blob([new Uint8Array([0, 255, 42])], { type: "image/png" }),
		"receipt.png",
		"receipt.png",
		"Receipt",
	],
	[
		"Blob with default filename",
		new Blob([new Uint8Array([0, 255, 42])]),
		undefined,
		"attachment",
		undefined,
	],
	[
		"Node Blob without a type cast",
		new NodeBlob([new Uint8Array([0, 255, 42])], { type: "image/png" }),
		"node-receipt.png",
		"node-receipt.png",
		undefined,
	],
	[
		"File with original name",
		new File([new Uint8Array([0, 255, 42])], "original.png"),
		undefined,
		"original.png",
		"",
	],
	[
		"File with overridden name",
		new File([new Uint8Array([0, 255, 42])], "original.png"),
		"override.png",
		"override.png",
		undefined,
	],
] as const) {
	test(`multipart upload: ${name}`, async () => {
		const attachment = { id: 4, file_name: expectedName };
		const { client, requests } = mockClient(() => json(attachment, 201), {
			apiKey: "test-key",
			headers: { "Content-Type": "application/json", "X-Custom": "kept" },
			bodySerializer: () => {
				throw new Error("Global serializer must not handle uploads");
			},
		});
		assert.deepEqual(
			await client.transactions.attachFile(123, { file, filename, notes }),
			attachment,
		);
		const request = requests[0];
		assert.ok(request);
		assert.equal(request.method, "POST");
		assert.equal(
			new URL(request.url).pathname,
			"/v2/transactions/123/attachments",
		);
		assert.match(
			request.headers.get("Content-Type") ?? "",
			/^multipart\/form-data; boundary=/,
		);
		assert.equal(request.headers.get("Authorization"), "Bearer test-key");
		assert.equal(request.headers.get("X-Custom"), "kept");
		const form = await request.formData();
		const uploadedFile = form.get("file");
		assert.ok(uploadedFile && typeof uploadedFile !== "string");
		assert.equal(uploadedFile.name, expectedName);
		assert.deepEqual(
			new Uint8Array(await uploadedFile.arrayBuffer()),
			new Uint8Array([0, 255, 42]),
		);
		assert.equal(form.get("notes"), notes ?? null);
	});
}

test("upload serialization does not affect later JSON requests", async () => {
	const { client, requests } = mockClient(() => json({ id: 1 }, 201));
	await client.transactions.attachFile(123, { file: new Blob(["receipt"]) });
	await client.transactions.update(123, { payee: "Updated" });
	assert.equal(
		requestAt(requests, 1).headers.get("Content-Type"),
		"application/json",
	);
	assert.deepEqual(await requestAt(requests, 1).json(), { payee: "Updated" });
});

test("new query options are forwarded, including false values", async () => {
	const { client, requests } = mockClient((r) =>
		r.method === "DELETE"
			? new Response(null, { status: 204 })
			: json({ id: 123 }),
	);
	await client.transactions.update(
		123,
		{ payee: "Updated" },
		{ update_balance: false },
	);
	await client.manualAccounts.delete(123, {
		delete_items: true,
		delete_balance_history: false,
	});
	await client.recurringItems.get(123, {
		start_date: "2026-01-01",
		end_date: "2026-01-31",
	});
	assert.deepEqual(
		requests.map((r) => [
			r.method,
			new URL(r.url).pathname,
			Object.fromEntries(new URL(r.url).searchParams),
		]),
		[
			["PUT", "/v2/transactions/123", { update_balance: "false" }],
			[
				"DELETE",
				"/v2/manual_accounts/123",
				{ delete_items: "true", delete_balance_history: "false" },
			],
			[
				"GET",
				"/v2/recurring_items/123",
				{ start_date: "2026-01-01", end_date: "2026-01-31" },
			],
		],
	);
	assert.deepEqual(await requestAt(requests, 0).json(), { payee: "Updated" });
});

test("existing calls omit optional query parameters", async () => {
	const { client, requests } = mockClient((r) =>
		r.method === "DELETE"
			? new Response(null, { status: 204 })
			: json({ id: 123 }),
	);
	await client.transactions.update(123, { payee: "Updated" });
	await client.manualAccounts.delete(123);
	await client.recurringItems.get(123);
	assert.ok(requests.every((r) => new URL(r.url).search === ""));
});

for (const [name, response] of [
	["empty without content length", () => new Response(null, { status: 500 })],
	[
		"empty",
		() =>
			new Response(null, { status: 500, headers: { "Content-Length": "0" } }),
	],
	["null", () => json(null, 500)],
	["false", () => json(false, 500)],
	[
		"structured",
		() => json({ message: "Failure", errors: [{ errMsg: "Detail" }] }, 500),
	],
	["top-level detail", () => json({ errMsg: "Failure" }, 500)],
] as const) {
	test(`${name} HTTP errors throw for data and void methods`, async () => {
		const { client } = mockClient(response);
		for (const operation of [
			() => client.user.getMe(),
			() => client.transactions.delete(123),
		]) {
			await assert.rejects(operation, (error) => {
				assert.ok(error instanceof LunchMoneyError);
				assert.equal(error.status, 500);
				if (name === "structured") {
					assert.equal(error.message, "Failure");
					assert.deepEqual(error.errors, [{ errMsg: "Detail" }]);
					assert.deepEqual(error.data, {
						message: "Failure",
						errors: [{ errMsg: "Detail" }],
					});
				} else if (name === "top-level detail") {
					assert.equal(error.message, "Failure");
					assert.deepEqual(error.errors, [{ errMsg: "Failure" }]);
				} else {
					assert.equal(error.message, "API request failed");
					assert.deepEqual(error.errors, []);
				}
				return true;
			});
		}
	});
}

test("successful 204 and 202 responses resolve without data", async () => {
	const { client } = mockClient(
		(r) =>
			new Response(null, {
				status: r.method === "DELETE" ? 204 : 202,
				headers: { "Content-Length": "0" },
			}),
	);
	assert.equal(await client.transactions.delete(123), undefined);
	assert.equal(await client.plaidAccounts.triggerFetch(), undefined);
});
