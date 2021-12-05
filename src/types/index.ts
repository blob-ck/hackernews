export interface Store {
  currentPage: number;
  pageSize: number;
  feeds: NewsFeed[];
}

export interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly time: number;
  readonly user: string;
  comments_count: number;
  type: string;
  url: string;
}

export interface NewsFeed extends News {
  title: string;
  domain: string;
  points: number;
  read?: boolean;
}

export interface NewsDetail extends News {
  title: string;
  domain: string;
  content: string;
  points: number;
  comments: [];
}

export interface NewsComment extends News {
  level: number;
  content: string;
  comments: [];
}

export interface RouteInfo {
  path: string;
  page: View;
}