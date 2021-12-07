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
    if (!this.isStart) {
      this.isStart = true;
      setTimeout(this.route.bind(this), 0)
    }
  }

  private route(): void {
    const routePath = location.hash;
    if (routePath === "" && this.defaultRoute) {
      this.defaultRoute.page.render();
      return;
    }

    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {

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
