// 0. function -> class
// 1. 공통요소추출
// 2. 구조분해할당
// 3. 라우터 구현
// 4. 접근제어
// 	-	private: 오로지 본클래스의 인스턴스 메서드로만 접근가능
// 	-	protected: 본클래스, 자식클래스의 인스턴스 메서드로 접근가능
// 	-	public: 인스턴스에서 직접 접근 가능

// 라우터에서 화면전환시 ~View 클래스의 인스턴스로 render() 호출
// 각 뷰의 기본 동작들은 클래스의 메서드로 정의
// 각 뷰의 기본 설정값은 속성으로 정의, 접근제한
//  => 데이터를 외부로 드러내지 않고 기능으로 제공

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

interface RouteInfo {
	path: string;
	page: View;
}

const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

const store: Store = {
	currentPage: 1,
	pageSize: 10,
	feeds: [],
}

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

class Api {
	ajax: XMLHttpRequest;
	url: string;

	constructor(url: string) {
		this.ajax = new XMLHttpRequest();
		this.url = url;
	}

	getRequest<AjaxResponse>(): AjaxResponse {
		this.ajax.open('GET', this.url, false);
		this.ajax.send();

		return JSON.parse(this.ajax.response);
	}
}

class NewsFeedApi extends Api {
	getData(): NewsFeed[] {
		return this.getRequest<NewsFeed[]>();
	}
}

class NewsDetailApi extends Api {
	getData(id: string): NewsDetail {
		return this.getRequest<NewsDetail>();
	}
}

// 라우터의 역할은 -> hash가 변경되었을 때 해당 화면으로 전환하는 것
// 정의한 각 화면에 해당하는 View클래스의 render()를 호출한다.
// View클래스는 몇개를 가져올 지 모름
// 그에 일치하는 hash값도 몇개가 추가될 지 모름
// 객체형태의 map데이터에 추가
// hash에 따른 수행할 작업도 정의 하려면 객체형태가 편함
// hash에 따른 속성과 작업을 정의? 클래스? 어떻게 하는게 유지보수하기 좋은가?(확장성, 안정성, 가독성, ...)
// 1.소스구현을 한 뒤 공통부분을 묶어 클래스로 만들거나,
// 2.필요한 작업을 명명한 뒤 구현해 나가는 방법 중
// 2의 방법으로 라우터 구현
class Router {

	defaultRoute: RouteInfo | null;
	routeTable: RouteInfo[];

	constructor() {

		// 아래처럼 이벤트를 등록하면, this.route를 호출하는건 브라우저의 이벤트시스템이므로
		// this가 가리키는 컨텍스트가 원하는 컨텍스트(여기서는 Route의 인스턴스)와 일치하지 않는다.
		// bind(this)로 현재 컨텍스트를 지정하여 엄한걸 가리키지 않도록 한다.
		// window.addEventListener("hashchange", this.route);
		// 최초 진입시 hashchange 이벤트는 발생하지 않으므로,
		// Route인스턴스 생성 후 필요한 path, page 정보를 등록한 후 
		// router.route() 실행
		window.addEventListener("hashchange", this.route.bind(this));

		this.defaultRoute = null;
		this.routeTable = [];
	}

	setDefaultPage(page: View): void {
		this.defaultRoute = { path: "", page };
	}

	addRoutePath(path: string, page: View): void {
		this.routeTable.push({ path, page });
	}

	route(): void {
		const routePath = location.hash;
		if (routePath == "" && this.defaultRoute) {
			this.defaultRoute.page.render();
			return;
		}

		for (const routeInfo of this.routeTable) {
			if (routePath.indexOf(routeInfo.path) >= 0) {
				routeInfo.page.render();
				break;
			}
		}
	}
}



// 공통 View 클래스
abstract class View {
	private container: HTMLElement;
	private template: string; // 원본 -> {{__key__}} 를 그대로 가지고 있는 원본문자열
	private renderTemplate: string; // replace된 html -> {{__key__}} 를 value로 바꾼 문자열
	private htmlList: string[];

	constructor(containerId: string, template: string) {
		const containerElement = document.getElementById(containerId);
		// container element가 없다면 앱 실행을 하지 못하므로,
		// this.container 타입에 union type으로 null을 쓰기보단 throw
		if (!containerElement) {
			throw '최상위 컨테이너가 없어 UI를 렌더링하지 못합니다.';
		}

		this.container = containerElement;
		this.template = template;
		this.renderTemplate = template;
		this.htmlList = [];
	}

	protected updateView(): void {
		this.container.innerHTML = this.renderTemplate;
		this.renderTemplate = this.template; // 데이터를 템플릿에 적용하여 렌더링 후 초기값으로 되돌림
	}

	// 마크업 조각들을 htmlsList에 push
	protected addHtml(htmlString: string): void {
		this.htmlList.push(htmlString);
	}

	// htmlList를 하나의 문자열로 합쳐 반환
	// getHtml을 호출하는 시점은 템플릿에 데이터를 매핑했을때 즉 렌더링에 필요한 준비를 끝낸 시점
	//  -> htmlList 배열을 초기화하여 다음 작업을 대비
	protected getHtml(): string {
		const snapshot = this.htmlList.join("");
		// this.htmlList = []; // 이렇게 직접 속성에 값을 할당하기보다, 메소드로 제공
		this.clearHtmlList();
		return snapshot;
	}

	private clearHtmlList(): void {
		this.htmlList = [];
	}

	// 구리고 반복되는 작업을 하나의 기능으로 제공
	// template = template.replace("{{__변수명__}}", 값)
	protected setTemplateData(key: string, value: string): void {
		this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
	}

	abstract render(): void;
}


// 인스턴스에 정보를 저장해 뒀다가 필요한 경우에 재사용
class NewsFeedView extends View {
	// 해당 인스턴스의 고유한 값들을 생성자에서 세팅
	// 변경될 수 있는 값과 고정값들을 분류
	// => 인스턴스의 속성값이 결정되는 시점을 생각하면 됨
	// => 라우터에서 인스턴스의 메소드를 호출하는 시점에 결정되는 값이 있다든가(detail 의 id)
	private api: NewsFeedApi;
	private feeds: NewsFeed[];
	constructor(containerId: string) {
		const template = `
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

		super(containerId, template);
		this.api = new NewsFeedApi(NEWS_URL);
		this.feeds = store.feeds;
		if (this.feeds.length === 0) {
			this.feeds = store.feeds = this.api.getData();
			this.makeFeeds();
		}
	}

	render() {
		store.currentPage = Number(location.hash.substr(7) || 1);
		const startFeedNumber = (store.currentPage - 1) * store.pageSize;
		const endFeedNumber = Math.min(store.currentPage * store.pageSize, this.feeds.length) - 1;
		for (let i = startFeedNumber; i <= endFeedNumber; i++) {
			const { read, id, title, comments_count, user, points, time_ago } = this.feeds[i];
			this.addHtml(`
					<div class="p-6 ${read ? "bg-yellow-500" : "bg-white"} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
						<div class="flex">
							<div class="flex-auto">
								<a href="#/show/${id}">${title}</a>
							</div>
							<div class="text-center text-sm">
								<div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
							</div>
						</div>
						<div class="flex mt-3">
							<div class="grid grid-cols-3 text-sm text-gray-500">
								<div><i class="fas fa-user mr-1"></i>${user}</div>
								<div><i class="fas fa-heart mr-1"></i>${points}</div>
								<div><i class="far fa-clock mr-1"></i>${time_ago}</div>
							</div>
						</div>
					</div>
				`);
		}

		this.setTemplateData("news_feed", this.getHtml());
		this.setTemplateData("prev_page", String(store.currentPage - 1 > 0 ? store.currentPage - 1 : 1));
		this.setTemplateData("next_page", String(this.feeds.length - 1 !== endFeedNumber ? store.currentPage + 1 : store.currentPage));

		this.updateView();
	}

	private makeFeeds(): void {
		for (let i = 0; i < this.feeds.length; i++) {
			this.feeds[i].read = false;
		}
	}
}

class NewsDetailView extends View {
	constructor(containerId: string) {
		let template = `
			<div class="bg-gray-600 min-h-screen pb-8">
				<div class="bg-white text-xl">
					<div class="mx-auto px-4">
						<div class="flex justify-between items-center py-6">
							<div class="flex justify-start">
								<h1 class="font-extrabold">Hacker News</h1>
							</div>
							<div class="items-center justify-end">
								<a href="#/page/{{__currentPage__}}" class="text-gray-500">
									<i class="fa fa-times"></i>
								</a>
							</div>
						</div>
					</div>
				</div>
	
				<div class="h-full border rounded-xl bg-white m-6 p-4 ">
					<h2>{{__title__}}</h2>
					<div class="text-gray-400 h-20">
						{{__content__}}
					</div>
					{{__comments__}}
				</div>
			</div>
		`;

		super(containerId, template);
	}

	render() {
		const id = location.hash.substr(7);
		const api = new NewsDetailApi(CONTENT_URL.replace("@id", id));
		const newsContent = api.getData(id);
		const { title, content, comments } = newsContent;
		for (let i = 0; i < store.feeds.length; i++) {
			if (Number(store.feeds[i].id) == Number(id)) {
				store.feeds[i].read = true;
				break;
			}
		}

		this.setTemplateData("currentPage", String(store.currentPage));
		this.setTemplateData("title", title);
		this.setTemplateData("content", content);
		this.setTemplateData("comments", this.makeComment(comments));

		this.updateView();
	}

	private makeComment(comments: NewsComment[]): string {
		for (let i = 0; i < comments.length; i++) {
			const comment: NewsComment = comments[i];
			this.addHtml(`
					<div style="padding-left: ${comment.level * 40}px;" class="mt-4">
						<div class="text-gray-400">
							<i class="fa fa-sort-up mr-2"></i>
							<strong>${comment.user}</strong> ${comment.time_ago}
						</div>
						<p class="text-gray-700">${comment.content}</p>
					</div>
				`);

			if (comment.comments.length > 0) {
				this.addHtml(this.makeComment(comment.comments));
			}
		}

		return this.getHtml();
	}
}


const router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/show/", newsDetailView);
router.route();