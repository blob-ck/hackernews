// https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md
// https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest
const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items
ajax.open("GET", NEWS_URL, false);
ajax.send();

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement("ul");

window.addEventListener("hashchange", function () {
	const id = location.hash.substr(1);
	ajax.open("GET", CONTENT_URL.replace("@id", id), false);
	ajax.send();

	const newsContent = JSON.parse(ajax.response);
	const title = document.createElement("h1");
	title.innerHTML = newsContent.title;
	content.appendChild(title);
});

for (let i = 0; i < newsFeed.length; i++) {
	// li, a 태그를 문자열로 사용하여 가독성을 높이고, innerHTML을 사용하여 DOM으로 변환하는 역할
	// 화면에 사용되지는 않는다.
	const div = document.createElement("div");
	div.innerHTML = `
		<li>
			<a href="#${newsFeed[i].id}">
				${newsFeed[i].title}(${newsFeed[i].comments_count})
			</a>
		</li>
	`;

	// ul.appendChild(div.children[0]);
	ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);
