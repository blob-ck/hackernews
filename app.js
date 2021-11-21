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
	const li = document.createElement("li");
	const a = document.createElement("a");

	a.innerHTML = `${newsFeed[i].title}(${newsFeed[i].comments_count})`;
	a.href = `#${newsFeed[i].id}`;
	// hash : 일종의 북마크로, hash 값이 변경되면 그 값과 일치하는 name을 가진 anker로 스크롤한다.(또는 값과 일치하는 id를 가진 요소로 스크롤)
	// ex> #  =>  #david 으로 hash 값이 변경되면 david 라는 name을 가진 anker로 스크롤(또는 david 라는 id를 가진 element로 스크롤)

	// a.addEventListener("click", function () {});
	// 각 anker 마다 이벤트를 등록할 수 있으나, 모든 요소에 이벤트를 등록하면 비효율적이다.
	// anker의 href 값으로 "#무언가" 를 저장하면 클릭시 hashchange 이벤트가 발생하는 것을 이용하여 한 번만 이벤트를 등록하자.
	// hash를 전역state로 사용, onhashchange 이벤트에 콜백 등록

	li.appendChild(a);
	ul.appendChild(li);
}

container.appendChild(ul);
container.appendChild(content);

`
<li></li>
`;
