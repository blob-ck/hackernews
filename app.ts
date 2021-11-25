type Store = {
	currentPage: number;
	pageSize: number;
	feeds: NewsFeed[]; //NewsFeed를 원소로 가지는 배열. Java의 제너릭 기능?
}

type NewsFeed = {
	id: number;
	title: string;
	comments_count: number;
	user: string;
	points: number;
	time_ago: string;
	read?: boolean;
}

// typescript 로 전환
// tsconfig.json 생성
// parcel(bundler & transpiler) 이 javascript로 컴파일
// sourcemap 파일 : 컴파일된 js와 사람이 작성한 ts파일의 연결점 for 디버깅
const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json"; // hacker-news individual items

// 객체 타입을 지정하는 방법은 2가지가 있는데
// 1. type alias <=== 여기선 이거 적용
// 2. interface
const store: Store = {
	currentPage: 1, // currentPage에 문자열을 할당하면 에러메시지를 보여준다.
	pageSize: 10,
	feeds: [],
}

// 함수의 파라미터 타입을 지정하면 함수 호출시 선언을 보러 왔다갔다 할 시간을 절약한다.
function getData(url) {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
	for (let i = 0; i < feeds.length; i++) {
		feeds[i].read = false;
	}

	return feeds;
}

// 이런 객체접근 오류 등을 방지하기 위한 소스를 타입가드 라고 부른다.
function updateView(html) {
	if (container != null) {
		container.innerHTML = html;
	} else {
		console.error('최상위 컨테이너가 없어 UI를 렌더링하지 못합니다.');
	}
}

function newsFeed() {
	let newsFeed: NewsFeed[] = store.feeds;
	if (newsFeed.length === 0) {
		newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
	}
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
			<div class="p-6 ${newsFeed[i].read ? "bg-yellow-500" : "bg-white"} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
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

	template = template.replace("{{__news_feed__}}", newsList.join(""));
	template = template.replace("{{__prev_page__}}", store.currentPage - 1 > 0 ? store.currentPage - 1 : 1);
	template = template.replace("{{__next_page__}}", newsFeed.length - 1 !== endFeedNumber ? store.currentPage + 1 : store.currentPage);

	// container 의 타입이 HTMLElement|null 이므로, null.innerHTML 에 접근하는 순간 에러 발생,
	// 방어코드를 짜도록 경고한다.
	// container.innerHTML = template;
	updateView(template);
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

	for (let i = 0; i < store.feeds.length; i++) {
		if (Number(store.feeds[i].id) == Number(id)) {
			store.feeds[i].read = true;
			break;
		}
	}

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

	// container 의 타입이 HTMLElement|null 이므로, null.innerHTML 에 접근하는 순간 에러 발생,
	// 방어코드를 짜도록 경고한다.
	// container.innerHTML = template.replace("{{__comments__}}", makeComment(newsContent.comments));
	updateView(template.replace("{{__comments__}}", makeComment(newsContent.comments)));
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
