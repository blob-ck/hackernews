// https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md
// https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest
const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items
const store = {
	currentPage: 1,
	pageSize: 10,
};

function getData(url) {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	if (newsFeed.length === 0) return console.log("No more news feeds");
	const startFeedNumber = (store.currentPage - 1) * store.pageSize;
	const endFeedNumber = Math.min(store.currentPage * store.pageSize, newsFeed.length) - 1;

	const newsList = [];
	// 템플릿으로 분산된 마크업을 한곳에 모아 복잡성을 줄인다.(ui 가독성을 높이기 위함)
	// tailwindcss cdn 방식으로 사용 및 class 에 적용
	let template = `
		<div class="container mx-auto p-4">
			<h1>Hacker News</h1>
			<ul>
				{{__news_feed__}}
			</ul>
			<div>
				<a href="#{{__prev_page__}}">이전 페이지</a>
				<a href="#{{__next_page__}}">다음 페이지</a>
			</div>
		</div>
	`;

	for (let i = startFeedNumber; i <= endFeedNumber; i++) {
		newsList.push(`
	<li>
		<a href="#/show/${newsFeed[i].id}">
		${newsFeed[i].title}(${newsFeed[i].comments_count})
		</a>
	</li> 
	`);
	}

	template = template.replace("{{__news_feed__}}", newsList.join(""));
	template = template.replace("{{__prev_page__}}", store.currentPage - 1 > 0 ? store.currentPage - 1 : 1);
	template = template.replace("{{__next_page__}}", newsFeed.length - 1 !== endFeedNumber ? store.currentPage + 1 : store.currentPage);

	container.innerHTML = template;
}

function newsDetail() {
	const id = location.hash.substr(7);
	const newsContent = getData(CONTENT_URL.replace("@id", id));

	container.innerHTML = `
		<h1>${newsContent.title}</h1>
		<div>
			<a href="#/page/${store.currentPage}">목록으로</a>
		</div>
	`;
}

function router() {
	const routePath = location.hash;

	if (routePath === "") {
		newsFeed();
	} else if (routePath.indexOf("/page/") >= 0) {
		store.currentPage = Number(routePath.substr(7));
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener("hashchange", router);

router();
