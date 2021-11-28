// type 두 가지[type alias, interface] 중 interface로 적용
interface Store {
	currentPage: number;
	pageSize: number;
	feeds: NewsFeed[];
}

interface News {
	readonly id: number;
	readonly time_ago: string;
	readonly time: number;
	readonly user: string;
	comments_count: number;
	type: string;
	url: string;
}

interface NewsFeed extends News {
	title: string;
	domain: string;
	points: number;
	read?: boolean;
}

interface NewsDetail extends News {
	title: string;
	domain: string;
	content: string;
	points: number;
	comments: [];
}

interface NewsComment extends News {
	level: number;
	content: string;
	comments: [];
}

// type alias는 아래 HTMLElement | null 처럼 union 타입을 지원하지만,
// interface는 union타입을 사용하지 못한다.
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

function getData<AjaxResponse>(url: string): AjaxResponse {
	ajax.open("GET", url, false);
	ajax.send();

	return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
	for (let i = 0; i < feeds.length; i++) {
		feeds[i].read = false; // readonly로 설정하면 경고를 띄운다.
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
