type Store = {
	currentPage: number;
	pageSize: number;
	feeds: NewsFeed[];
}

// type alias 도 중복되는 속성을 묶을 수 있다.
// intersection 이라 부르는 기능으로,
// type [Alias] = [CommonAlias] & {[property]:[type];} 으로 사용가능
type News = {
	id: number;
	time_ago: string;
	time: number;
	user: string;
	comments_count: number;
	type: string;
	url: string;
}

type NewsFeed = News & {
	title: string;
	domain: string;
	points: number;
	read?: boolean;
}

type NewsDetail = News & {
	title: string;
	domain: string;
	content: string;
	points: number;
	comments: [];
}

type NewsComment = News & {
	level: number;
	content: string;
	comments: [];
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const store: Store = {
	currentPage: 1,
	pageSize: 10,
	feeds: [],
}

// getData는 사용하는 url 에 따라 반환하는 타입이 다를수 있디ㅏ.
// 제너릭 : 입력이 n 개라면, 출력도 n 개로 정의함
// function 함수명<type> 으로 사용한다.
// 호출시 getData<NewsFeed[]>("http......");  이런 식
// 반환타입을 특정type으로 받겠다고 명시하고 함수를 호출하므로 헷갈릴 일이 없다.
// 호출시 함수에 추가 파라미터로 반환타입을 넘겼다고 생각하면 쉽다.
// 또는 제네럭 함수는 wrapping함수이고, 호출시 반환타입을 특정하여 함수를 생성, 반환, 즉시호출한다고도 볼 수있다.
function getData<AjaxResponse>(url: string): AjaxResponse {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
	for (let i = 0; i < feeds.length; i++) {
		feeds[i].read = false;
	}

	return feeds;
}

function updateView(html: string): void {
	if (container != null) {
		container.innerHTML = html;
	} else {
		console.error('최상위 컨테이너가 없어 UI를 렌더링하지 못합니다.');
	}
}

function newsFeed(): void {
	let newsFeed: NewsFeed[] = store.feeds;
	if (newsFeed.length === 0) {
		// getData를 호출할 때 반환받을 타입을 명시
		newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
	}
	const startFeedNumber = (store.currentPage - 1) * store.pageSize;
	const endFeedNumber = Math.min(store.currentPage * store.pageSize, newsFeed.length) - 1;

	const newsList = [];
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
	template = template.replace("{{__prev_page__}}", String(store.currentPage - 1 > 0 ? store.currentPage - 1 : 1));
	template = template.replace("{{__next_page__}}", String(newsFeed.length - 1 !== endFeedNumber ? store.currentPage + 1 : store.currentPage));

	updateView(template);
}

function newsDetail() {
	const id = location.hash.substr(7);
	// getData를 호출할 때 반환받을 타입을 명시
	const newsContent = getData<NewsDetail>(CONTENT_URL.replace("@id", id));
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

	updateView(template.replace("{{__comments__}}", makeComment(newsContent.comments)));
}

function makeComment(comments: NewsComment[]): string {
	const commentString = [];
	for (let i = 0; i < comments.length; i++) {
		const comment: NewsComment = comments[i];
		commentString.push(`
				<div style="padding-left: ${comment.level * 40}px;" class="mt-4">
					<div class="text-gray-400">
						<i class="fa fa-sort-up mr-2"></i>
						<strong>${comment.user}</strong> ${comment.time_ago}
					</div>
					<p class="text-gray-700">${comment.content}</p>
				</div>
			`);

		if (comment.comments.length > 0) {
			commentString.push(makeComment(comment.comments));
		}
	}

	return commentString.join("");
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
