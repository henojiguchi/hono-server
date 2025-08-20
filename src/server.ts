import { Hono } from "hono";
const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/api/hello", (c) => {
	return c.json({ message: "Hello from Hono server!" });
});

app.post("/api/echo", async (c) => {
	const body = await c.req.json();
	return c.json({ received: body });
});

// 要望分析エンドポイント（第1段階：固定レスポンス）
app.post("/api/analyze", async (c) => {
	try {
		const body = await c.req.json();
		const request = body.request;
		console.log("受信した要望:", request);

		// まずは固定のレスポンスを返す
		return c.json({
			message: "要望を受け取りました",
			request: request,
			repository: "dashboard", // 仮の固定値
		});
	} catch (error) {
		console.error("エラー:", error);
		return c.json({ error: "リクエストの処理に失敗しました" }, 400);
	}
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
