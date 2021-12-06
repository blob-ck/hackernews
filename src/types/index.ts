import View from '../core/view';

export interface NewsStore {
  getAllFeeds: () => NewsFeed[];
  getFeed: (position: number) => NewsFeed;
  setFeeds: (feeds: NewsFeed[]) => void;
  makeRead: (id: number) => void;
  hasFeeds: boolean;
  currentPage: number;
  numberOfFeed: number;
  prevPage: number;
  nextPage: number;
  pageSize: number;
}

export interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly time: number;
  readonly user: string;
  readonly comments_count: number;
  readonly type: string;
  readonly url: string;
}

export interface NewsFeed extends News {
  readonly title: string;
  readonly domain: string;
  readonly points: number;
  read?: boolean;
}

export interface NewsDetail extends News {
  readonly title: string;
  readonly domain: string;
  readonly content: string;
  readonly points: number;
  readonly comments: [];
}

export interface NewsComment extends News {
  readonly level: number;
  readonly content: string;
  readonly comments: [];
}

export interface RouteInfo {
  path: string;
  page: View;
  params: RegExp | null;
}
