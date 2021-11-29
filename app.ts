// 작업내용
// 1. getData 클래스 변환
// 2. 공통요소 뽑아내기
// 3. 믹스인을 이용한 상속
// 4. applyApiMixins

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

// MixIN 적용 - 언어에서 지원하지 않고, 코드 테크닉으로 전개
// 타입스크립트 공식문서에도 나오는 믹스인 코드
function applyApiMixIns(targetClass: any, baseClasses: any[]): void {
	baseClasses.forEach((baseClass) => {
		Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
			const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

			if (descriptor) {
				Object.defineProperty(targetClass.prototype, name, descriptor)
			}
		})
	})
}

// url, ajax 속성은 더이상 필요 없으므로 constructor에서 제거
class Api {
	getRequest<AjaxResponse>(url: string): AjaxResponse {
		const ajax = new XMLHttpRequest();
		ajax.open('GET', url, false);
		ajax.send();

		return JSON.parse(ajax.response);
	}
}

class NewsFeedApi {
	getData(): NewsFeed[] {
		return this.getRequest<NewsFeed[]>(NEWS_URL);
	}
}

class NewsDetailApi {
	getData(id: string): NewsDetail {
		return this.getRequest<NewsDetail>(CONTENT_URL.replace("@id", id));
	}
}

// this.getRequest에 경고 밑줄이 표시되는데 이는 클래스 선언시 상속을 하지 않아서
// 타입스크립트 컴파일러가 캐치하시 못해서 그렇다.
// 실제 런타임에 applyApiMixIns가 실행되어야 각 클래스에 Api의 속성들이 추가되므로,
// 컴퍼일러에 Api를 상속받을거라고 명시해야 this.getRequest접근에 대한 경고를 하지 않는다.
// => interface를 선언하여 해결한다.
interface NewsFeedApi extends Api { };
interface NewsDetailApi extends Api { };

// applyApiMixIns(A, B); -> A에 B의 기능을 확장하겠다는 의미
// 언어 자체로 상속을 지원하지만 믹스인을 사용하는 이유 두 가지
// 1. 상속관계에 유연성이 필요할 때 - 필요할 때마다 applyApiMixIns를 호출하여 상속관계를 능동적으로 바꿀 수 있다.
// 2. 다중상속을 하기 위함 (extends로는 불가능)
applyApiMixIns(NewsFeedApi, [Api]);
applyApiMixIns(NewsDetailApi, [Api]);

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
	const api = new NewsFeedApi();
	let newsFeed: NewsFeed[] = store.feeds;
	if (newsFeed.length === 0) {
		newsFeed = store.feeds = makeFeeds(api.getData());
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
	const api = new NewsDetailApi();
	const newsContent = api.getData(id);
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
