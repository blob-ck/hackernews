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

// ui작업은 크게 3가지 : [ 디자인, 폰트, 아이콘 ]
// 이 중 아이콘은 font-awsome 라이브러리 사용
// cdnjs.com 에서 fontawosome 검색하여 cdn 적용
function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	if (newsFeed.length === 0) return console.log("No more news feeds");
	const startFeedNumber = (store.currentPage - 1) * store.pageSize;
	const endFeedNumber = Math.min(store.currentPage * store.pageSize, newsFeed.length) - 1;

	const newsList = [];
	// 템플릿을 직접 만드는 것도 재미있지만, 큰 싸이클을 우선 돌리기 위해 라이브러리 사용해보기
	// ==> handlebars, mustache
	let template = `
		<div class="bg-gray-600 min-h-screen">
			<div class="bg-white text-xl">
				<div class="mx-auto px-4">
					<div class="flex justify-between items-center py-6">
						<div class="flex justify-start">
							<h1 class="font-extrabold">Hacker News</h1>
						</div>
						<div class="items-center justify-end">
							<a href="#/page/{{__prev_page__}}" class="text-gray-500">
								Previous
							</a>
							<a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
								Next
							</a>
						</div>
					</div> 
				</div>
			</div>
			<div class="p-4 text-2xl text-gray-700">
				{{__news_feed__}}        
			</div>
		</div>
	`;

	for (let i = startFeedNumber; i <= endFeedNumber; i++) {
		newsList.push(`
			<div class="p-6 ${newsFeed[i].read ? "bg-red-500" : "bg-white"} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
				<div class="flex">
					<div class="flex-auto">
						<a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
					</div>
					<div class="text-center text-sm">
						<div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
					</div>
				</div>
				<div class="flex mt-3">
					<div class="grid grid-cols-3 text-sm text-gray-500">
						<div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
						<div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
						<div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
					</div>  
				</div>
			</div>  
		`);
	}

	// 템플릿을 적용하긴 했지만 데이터를 매핑할 때마다 replace를 하고 있어 좋은 패턴은 아니다.
	// ==> 템플릿에 반복되는 작업을 데이터 갯수만큼 코드를 작성했다.
	template = template.replace("{{__news_feed__}}", newsList.join(""));
	template = template.replace("{{__prev_page__}}", store.currentPage - 1 > 0 ? store.currentPage - 1 : 1);
	template = template.replace("{{__next_page__}}", newsFeed.length - 1 !== endFeedNumber ? store.currentPage + 1 : store.currentPage);

	container.innerHTML = template;
}

function newsDetail() {
	const id = location.hash.substr(7);
	const newsContent = getData(CONTENT_URL.replace("@id", id));
	let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>	
	`;

	// commnets 의 각 요소안에도 comments 가 있을 수 있다. (대댓글)
	// while 과 recursion 이 떠오르나 여기서는 recursion 을 적용,
	// makeComment가 호출된 횟수로 대댓글 indent를 적용
	function makeComment(comments, called = 0) {
		const commentString = [];
		for (let i = 0; i < comments.length; i++) {
			commentString.push(`
				<div style="padding-left: ${called * 40}px;" class="mt-4">
					<div class="text-gray-400">
						<i class="fa fa-sort-up mr-2"></i>
						<strong>${comments[i].user}</strong> ${comments[i].time_ago}
					</div>
					<p class="text-gray-700">${comments[i].content}</p>
				</div>  
			`);

			if (comments[i].comments.length > 0) {
				commentString.push(makeComment(comments[i].comments, called + 1));
			}
		}

		return commentString.join("");
	}

	// innerHTML 에 배열을 할당해도  각 원소를 toString() 하여 렌더링한다.
	container.innerHTML = template.replace("{{__comments__}}", makeComment(newsContent.comments));
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
