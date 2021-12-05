import { Store } from './types';
import Router from './core/router';
import { NewsDetailView, NewsFeedView } from './page';
// 위 처럼 page에 index.ts 에서 export를 미리 기술해놓으면 
// 사용하는 측에서는 page 하위 디렉토리 내 정보에 대해서 관심을 갖이 않아도 된다.
// import NewsFeedView from './page/news-feed-view';
// import NewsDetailView from './page/news-detail-view';

const store: Store = {
	currentPage: 1,
	pageSize: 10,
	feeds: [],
}

// view 에서 store를 사용중이나, 접근할 방법을 마련하지 않아서 에러남
// 임시로 window 의 속성으로 추가
// 자바스크립트는 window.store 사용하면 되지만 타입스크립트는 안됨
declare global {
	interface Window {
		store: Store;
	}
}

window.store = store;

const router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/show/", newsDetailView);
router.route();