import { NewsFeed, NewsStore } from './types'

export default class Store implements NewsStore {
  private _feeds: NewsFeed[];
  private _currentPage: number;
  private _pageSize: number;

  constructor() {
    this._feeds = [];
    this._currentPage = 1;
    this._pageSize = 10;
  }

  get currentPage() {
    return this._currentPage;
  }

  set currentPage(page: number) {
    this._currentPage = page;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(pageSize: number) {
    if (pageSize <= 0) return;
    this._pageSize = pageSize;
  }

  get prevPage(): number {
    return this._currentPage - 1 > 0 ? this._currentPage - 1 : 1
  }

  get nextPage(): number {
    const endFeedNumber = Math.min(this._currentPage * this._pageSize, this._feeds.length) - 1;
    return this._feeds.length - 1 !== endFeedNumber ? this._currentPage + 1 : this._currentPage;
  }

  get numberOfFeed(): number {
    return this._feeds.length;
  }

  get hasFeeds(): boolean {
    return this._feeds.length > 0
  }

  getAllFeeds(): NewsFeed[] {
    return this._feeds;
  }

  getFeed(position: number): NewsFeed {
    return this._feeds[position];
  }

  setFeeds(feeds: NewsFeed[]): void {
    this._feeds = feeds.map(feed => {
      return { ...feed, read: false };
    });
  }

  makeRead(id: number): void {
    const feed = this._feeds.find((feed: NewsFeed) => feed.id === id);
    if (feed) {
      feed.read = true;
    }
  }
}