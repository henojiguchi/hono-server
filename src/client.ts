// APIを叩くテストクライアント
async function testAPI() {
	// GETリクエスト
	const getResponse = await fetch("http://localhost:3000/api/hello");
	const getData = await getResponse.json();
	console.log("GET:", getData);

	// POSTリクエスト
	const postResponse = await fetch("http://localhost:3000/api/echo", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ test: "data" }),
	});
	const postData = await postResponse.json();
	console.log("POST:", postData);
}

testAPI();
