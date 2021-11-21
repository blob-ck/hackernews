// https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md
// https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest
const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items

function getData(url) {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

// ui를 문자열로 전환
// 상세화면으로 전환하기 위해 기존에 제목을 덧붙이던 동작 삭제
window.addEventListener("hashchange", function () {
	const id = location.hash.substr(1);
	const newsContent = getData(CONTENT_URL.replace("@id", id));

	container.innerHTML = `
		<h1>${newsContent.title}</h1>
		<div>
			<a href="#">목록으로</a>
		</div>
	`;
});

// 목록화면을 appendChild로 덧붙이는 방식에서 innerHTML 로 싹 밀어버림
// ui형태가 ul이 바깥에서 감싸고 li>a 가 반복되는 형태
// 배열을 사용하여 마지막에 하나로 합치기
const newsList = [];
newsList.push("<ul>");
for (let i = 0; i < newsFeed.length; i++) {
	newsList.push(`
	<li>
		<a href="#${newsFeed[i].id}">
		${newsFeed[i].title}(${newsFeed[i].comments_count})
		</a>
	</li>
	`);
}
newsList.push("</ul>");

// 현재 뒤로가기는 기능하지 않는 상태
container.innerHTML = newsList.join("");
