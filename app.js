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

// 화면전환을 중계하는 라우터를 작성하기 전,
// 화면전환시 목록 렌더링을 호출하므로
// 목록을 그려낼 소스를 재사용가능하도록 함수로 만든다.
function newsFeed() {
	const newsFeed = getData(NEWS_URL);
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

	container.innerHTML = newsList.join("");
}

function newsDetail() {
	const id = location.hash.substr(1);
	const newsContent = getData(CONTENT_URL.replace("@id", id));

	container.innerHTML = `
		<h1>${newsContent.title}</h1>
		<div>
			<a href="#">목록으로</a>
		</div>
	`;
}

// hash값의 변화에 따라 화면전환을 하므로,
// hashchange 이벤트로 router를 등록하고 hash값으로 화면전환한다.
function router() {
	const routePath = location.hash;

	// location.hash 에 # 만 있을 경우에는 빈 문자열을 반환한다.
	if (routePath === "") {
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener("hashchange", router);

router();
