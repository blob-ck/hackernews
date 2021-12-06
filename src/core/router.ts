import { RouteInfo } from '../types';
import View from './view';

export default class Router {

  defaultRoute: RouteInfo | null;
  routeTable: RouteInfo[];
  isStart: boolean;

  constructor() {

    window.addEventListener("hashchange", this.route.bind(this));

    this.defaultRoute = null;
    this.routeTable = [];
    this.isStart = false;
  }

  setDefaultPage(page: View, params: RegExp | null = null): void {
    this.defaultRoute = { path: "", page, params };
  }

  addRoutePath(path: string, page: View, params: RegExp | null = null): void {
    this.routeTable.push({ path, page, params });

    // app.ts 에서 router.route() 를 실행하던 것에서,
    // private으로 감추고 최초 addRoutePath 호출시 한 번은 자동으로 실행되도록 수정
    if (!this.isStart) {
      console.log('최초 조회 시작')
      this.isStart = true;
      setTimeout(this.route.bind(this), 0)
    }
  }

  private route(): void {
    const routePath = location.hash;
    console.log(routePath)
    if (routePath === "" && this.defaultRoute) {
      this.defaultRoute.page.render();
      return;
    }

    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {

        // RouteInfo 의 세번째 인자(params)로 hash값을 분해할 정규식 사용
        if (routeInfo.params) {
          const parseParams = routePath.match(routeInfo.params);

          if (parseParams) {
            routeInfo.page.render.apply(null, [parseParams[1]]);
          }
        } else {
          routeInfo.page.render();
        }

        return;
      }
    }
  }
}
