// 要望管理Bot APIのテストクライアント

// 1. 要望分析のテスト
async function testAnalyze() {
	console.log("=== 要望分析テスト ===\n");
	
	const testCases = [
		"ログイン画面が重い",
		"APIの認証エラーが発生している",
		"通話スケジュールが正しく動作しない",
		"音声認識の精度を改善したい",
		"ホームページのお問い合わせフォームが送信できない"
	];

	for (const request of testCases) {
		console.log(`📝 要望: "${request}"`);
		
		const response = await fetch("http://localhost:3000/api/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ request })
		});
		
		const data = await response.json();
		console.log(`🤖 判定結果: 製品=${data.product}, 信頼度=${data.confidence}`);
		console.log(`📋 確認事項: ${data.questions.length}個の質問を生成\n`);
	}
}

// 2. 要件定義書生成のテスト
async function testGenerateRequirement() {
	console.log("=== 要件定義書生成テスト ===\n");
	
	const testData = {
		request: "ログイン画面の表示が遅く、10秒以上かかることがある",
		product: "dashboard",
		answers: {
			current_behavior: "ログインボタンを押してから画面遷移まで10秒以上かかる",
			expected_behavior: "2-3秒以内に画面遷移を完了させたい",
			impact_scope: "全ユーザー（約1000名）に影響",
			urgency: "高（今週中に対応希望）"
		}
	};

	const response = await fetch("http://localhost:3000/api/generate-requirement", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testData)
	});

	const data = await response.json();
	console.log(`📄 要件定義書ID: ${data.id}`);
	console.log(`✅ ${data.message}\n`);
	console.log("=== 生成された要件定義書 ===");
	console.log(data.content);
}

// 3. 統合テスト（要望分析→要件定義書生成）
async function testFullFlow() {
	console.log("\n=== 統合テスト: 要望分析→要件定義書生成 ===\n");
	
	const request = "ダッシュボードのグラフ表示が正しくない。売上データが0と表示される";
	
	// Step 1: 要望分析
	console.log("Step 1: 要望を分析...");
	const analyzeResponse = await fetch("http://localhost:3000/api/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ request })
	});
	
	const analysis = await analyzeResponse.json();
	console.log(`✅ 製品判定完了: ${analysis.product}`);
	
	// Step 2: 要件定義書生成（質問への回答を仮定）
	console.log("\nStep 2: 要件定義書を生成...");
	const requirementData = {
		request: request,
		product: analysis.product,
		answers: {
			current_behavior: "ダッシュボードのグラフが全て0表示になる",
			expected_behavior: "実際の売上データを正しく表示する",
			impact_scope: "管理者ユーザー全員",
			urgency: "中"
		}
	};
	
	const requirementResponse = await fetch("http://localhost:3000/api/generate-requirement", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(requirementData)
	});
	
	const requirement = await requirementResponse.json();
	console.log(`✅ ${requirement.message}`);
	console.log(`📄 要件定義書ID: ${requirement.id}`);
}

// メイン実行
async function main() {
	console.log("🤖 要望管理Bot API テスト開始\n");
	
	try {
		await testAnalyze();
		await testGenerateRequirement();
		await testFullFlow();
		
		console.log("\n✅ 全てのテストが完了しました！");
	} catch (error) {
		console.error("❌ エラーが発生しました:", error);
	}
}

main();
