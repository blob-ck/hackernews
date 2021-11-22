// https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md
// https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest
const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items
const store = {
	currentPage: 1,
	pageSize: 10, //페이지 사이즈 추가
};

function getData(url) {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

// 페이징 적용하기
function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	const startFeedNumber = (store.currentPage - 1) * store.pageSize;
	const endFeedNumber = Math.min(store.currentPage * store.pageSize, newsFeed.length);

	if (newsFeed.length === 0) return console.log("No more news feeds");

	const newsList = [];

	newsList.push("<ul>");

	for (let i = startFeedNumber; i < endFeedNumber; i++) {
		// router에서 특정페이지의 목록과 특정상세화면을 분기하기 위해 show, page 등을 붙여 구분한다.
		newsList.push(`
	<li>
		<a href="#/show/${newsFeed[i].id}">
		${newsFeed[i].title}(${newsFeed[i].comments_count})
		</a>
	</li> 
	`);
	}

	newsList.push("</ul>");
	newsList.push(`
		<div>
			<a href="#/page/${store.currentPage - 1 > 0 ? store.currentPage - 1 : 1}">이전 페이지</a>
			<a href="#/page/${newsFeed.length !== endFeedNumber ? store.currentPage + 1 : store.currentPage}">다음 페이지</a>
		</div>
	`);
	container.innerHTML = newsList.join("");
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
		// 상태저장 변수인 store 는 전용 getter/setter 를 만들어 사용하는게 유지보수에 더 좋지 않나?
		store.currentPage = Number(routePath.substr(7));
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener("hashchange", router);

router();
