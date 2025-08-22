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

// 要望分析エンドポイント（実装版）
app.post("/api/analyze", async (c) => {
	try {
		const body = await c.req.json();
		const request = body.request;
		console.log("受信した要望:", request);

		// 要望内容を分析して製品を判定
		const analysis = analyzeRequest(request);
		
		// Bot応答メッセージを生成
		const response = {
			message: `🤖 要望管理Bot\nこの要望を確認しました。内容を分析した結果、**製品: ${analysis.product}** に関連する案件と判定いたします。`,
			request: request,
			product: analysis.product,
			confidence: analysis.confidence,
			questions: [
				{
					id: "current_behavior",
					label: "現在の動作",
					question: "現在どのような問題が発生していますか？具体的な状況を教えてください。"
				},
				{
					id: "expected_behavior", 
					label: "期待する動作",
					question: "どのように動作することを期待していますか？"
				},
				{
					id: "impact_scope",
					label: "影響範囲",
					question: "この問題はどの程度のユーザーに影響していますか？"
				},
				{
					id: "urgency",
					label: "緊急度",
					question: "いつまでに対応が必要でしょうか？（高/中/低）"
				}
			],
			analysis_details: analysis
		};

		return c.json(response);
	} catch (error) {
		console.error("エラー:", error);
		return c.json({ error: "リクエストの処理に失敗しました" }, 400);
	}
});

// 要望内容を分析して製品を判定する関数
function analyzeRequest(request: string) {
	const lowerRequest = request.toLowerCase();
	
	// キーワードと製品のマッピング
	const productKeywords = {
		"recho-platform-dashboard": {
			keywords: ["ログイン", "画面", "ui", "表示", "ボタン", "レイアウト", "デザイン", "グラフ", "ダッシュボード"],
			weight: 0
		},
		"recho-platform-dashboard-api": {
			keywords: ["api", "認証", "データベース", "サーバー", "バックエンド", "権限", "セキュリティ"],
			weight: 0
		},
		"recho-platform-call-runner": {
			keywords: ["通話", "架電", "スケジュール", "csv", "電話番号", "発信"],
			weight: 0
		},
		"recho-platform-voiceagent-server": {
			keywords: ["音声", "ai", "対話", "認識", "合成", "会話"],
			weight: 0
		},
		"recho-corporate-site": {
			keywords: ["サイト", "ホームページ", "お問い合わせ", "ニュース", "採用"],
			weight: 0
		}
	};

	// キーワードマッチングでスコアを計算
	for (const [product, data] of Object.entries(productKeywords)) {
		for (const keyword of data.keywords) {
			if (lowerRequest.includes(keyword)) {
				data.weight += 1;
			}
		}
	}

	// 最もスコアが高い製品を選択
	let maxWeight = 0;
	let selectedProduct = "不明";
	
	for (const [product, data] of Object.entries(productKeywords)) {
		if (data.weight > maxWeight) {
			maxWeight = data.weight;
			selectedProduct = product;
		}
	}

	// 製品名を簡潔に
	const productNames: { [key: string]: string } = {
		"recho-platform-dashboard": "dashboard",
		"recho-platform-dashboard-api": "dashboard-api",
		"recho-platform-call-runner": "call-runner",
		"recho-platform-voiceagent-server": "voiceagent-server",
		"recho-corporate-site": "corporate-site"
	};

	return {
		product: productNames[selectedProduct] || "不明",
		fullProductName: selectedProduct,
		confidence: maxWeight > 0 ? "high" : "low",
		matchedKeywords: maxWeight,
		rawScores: productKeywords
	};
}

// 要件定義書生成エンドポイント
app.post("/api/generate-requirement", async (c) => {
	try {
		const body = await c.req.json();
		const { request, product, answers } = body;

		// ID生成（REQ-YYYYMM-XXX形式）
		const now = new Date();
		const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
		const sequenceNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
		const requirementId = `REQ-${yearMonth}-${sequenceNumber}`;

		// 要件定義書を生成
		const requirement = generateRequirementDocument({
			id: requirementId,
			request,
			product: product || "未定",
			answers: answers || {},
			createdAt: now.toISOString().split('T')[0]
		});

		return c.json({
			id: requirementId,
			content: requirement,
			message: `要件定義書 ${requirementId} を作成しました`,
			product: product
		});
	} catch (error) {
		console.error("エラー:", error);
		return c.json({ error: "要件定義書の生成に失敗しました" }, 400);
	}
});

// 要件定義書のMarkdownを生成する関数
function generateRequirementDocument(params: {
	id: string;
	request: string;
	product: string;
	answers: any;
	createdAt: string;
}) {
	const { id, request, product, answers, createdAt } = params;

	// 要件定義書テンプレート
	const template = `# 📋 要件定義書

## 基本情報
- **ID**: ${id}
- **作成日**: ${createdAt}
- **対象製品**: ${product}
- **ステータス**: draft

## 要望概要
**元の要望**: 
${request}

## 詳細情報

### 現在の動作
${answers.current_behavior || "（情報収集中）"}

### 期待する動作
${answers.expected_behavior || "（情報収集中）"}

### 影響範囲
${answers.impact_scope || "（情報収集中）"}

### 緊急度
${answers.urgency || "（情報収集中）"}

## 分析結果

### 製品判定
- **対象製品**: ${product}
- **判定理由**: 要望内容のキーワード分析による自動判定

### 関連仕様
${getRelatedSpecs(product)}

## 対応方針
（経営判断待ち）

## 備考
- この要件定義書は自動生成されました
- 追加情報が必要な場合は担当者にお問い合わせください

---
*Generated by 要望管理Bot*`;

	return template;
}

// 製品に応じた関連仕様を取得
function getRelatedSpecs(product: string) {
	const specs: { [key: string]: string } = {
		"dashboard": `- features/sign-in
- features/view-dashboard
- routes/home`,
		"dashboard-api": `- api/auth
- api/organization
- api/project`,
		"call-runner": `- 通話実行機能
- スケジューリング機能`,
		"voiceagent-server": `- 音声処理機能
- AI対話機能`,
		"corporate-site": `- features/view-contact
- features/view-news-list`,
		"未定": "- （製品特定後に追加）"
	};

	return specs[product] || "- （関連仕様を調査中）";
}

// Lark Webhook受信エンドポイント
app.post("/webhook/lark", async (c) => {
	try {
		const body = await c.req.json();
		console.log("Lark Webhook受信:", JSON.stringify(body, null, 2));

		// イベントタイプを確認
		const eventType = body.header?.event_type;
		
		// URL検証リクエストの処理
		if (body.type === "url_verification") {
			console.log("URL検証リクエスト");
			return c.json({ challenge: body.challenge });
		}

		// タスク作成イベントの処理
		if (eventType === "task.created" || eventType === "task.v1.created") {
			const taskData = body.event;
			const taskId = taskData.task_id || taskData.guid;
			const taskTitle = taskData.summary || taskData.title || "タイトルなし";
			const taskDescription = taskData.description || "";
			
			console.log(`📝 新規タスク検知: ${taskTitle}`);
			
			// 要望内容を分析
			const requestText = `${taskTitle} ${taskDescription}`.trim();
			const analysis = analyzeRequest(requestText);
			
			// Bot応答メッセージを作成
			const botMessage = `🤖 要望管理Bot
この要望を確認しました。内容を分析した結果、**製品: ${analysis.product}** に関連する案件と判定いたします。

@担当者 この要望について詳細をお聞かせください。

📝 **確認事項**
1. **現在の動作**: 現在どのような問題が発生していますか？
2. **期待する動作**: どのように動作することを期待していますか？
3. **影響範囲**: この問題の影響範囲を教えてください
4. **緊急度**: 対応の優先度を教えてください（高/中/低）`;

			// TODO: Lark Task Comment APIを呼び出してコメント投稿
			console.log("Bot応答:", botMessage);
			
			return c.json({
				success: true,
				message: "タスク作成イベントを処理しました",
				taskId: taskId,
				product: analysis.product
			});
		}

		// コメント追加イベントの処理
		if (eventType === "task.comment.created" || eventType === "comment.created") {
			const comment = body.event;
			const commentContent = comment.content || "";
			const taskId = comment.task_id || comment.resource_id;
			
			console.log(`💬 コメント受信: ${commentContent}`);
			
			// TODO: コメント内容を解析して追加情報を収集
			// TODO: 情報が揃ったら要件定義書を生成
			
			return c.json({
				success: true,
				message: "コメントを受信しました",
				taskId: taskId
			});
		}

		// その他のイベント
		console.log(`未対応のイベントタイプ: ${eventType}`);
		return c.json({ 
			success: true,
			message: `イベントタイプ ${eventType} は未対応です`
		});

	} catch (error) {
		console.error("Webhook処理エラー:", error);
		return c.json({ error: "Webhook処理に失敗しました" }, 500);
	}
});

// Lark Task Comment API呼び出し関数（TODO: 実装）
async function postLarkComment(taskId: string, content: string) {
	// TODO: Lark認証トークン取得
	// TODO: Task Comment API呼び出し
	console.log(`[TODO] タスク ${taskId} にコメント投稿: ${content}`);
}

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
