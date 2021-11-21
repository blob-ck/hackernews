// https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md
// https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest
const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items

// 중복된 기능을 하나로 묶음
function getData(url) {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

window.addEventListener("hashchange", function () {
	const id = location.hash.substr(1);
	const newsContent = getData(CONTENT_URL.replace("@id", id));
	const title = document.createElement("h1");

	title.innerHTML = newsContent.title;
	content.appendChild(title);
});

for (let i = 0; i < newsFeed.length; i++) {
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
