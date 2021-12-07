import { NewsFeed, NewsDetail } from '../types';

export class Api {
  xhr: XMLHttpRequest;
  url: string;

  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
  }

  getRequestWithXHR<AjaxResponse>(callback: (data: AjaxResponse) => void): void {
    this.xhr.open('GET', this.url);
    this.xhr.addEventListener("load", () => {
      callback(JSON.parse(this.xhr.response) as AjaxResponse);
    });
    this.xhr.send();
  }

  getRequestWithPromise<AjaxResponse>(callback: (data: AjaxResponse) => void): void {
    fetch(this.url)
      .then(response => response.json())
      .then(callback)
      .catch(() => console.log("데이터를 불러오지 못했습니다."));
  }

  async request<AjaxResponse>(): Promise<AjaxResponse> {
    const response = await fetch(this.url);
    return await response.json() as AjaxResponse; // .json() 자체도 비동기므로 await 붙여준다
  }
}

export class NewsFeedApi extends Api {
  constructor(url: string) {
    super(url);
  }

  getDataWithXHR(callback: (data: NewsFeed[]) => void): void {
    this.getRequestWithXHR<NewsFeed[]>(callback);
  }

  getDataWithPromise(callback: (data: NewsFeed[]) => void): void {
    this.getRequestWithPromise<NewsFeed[]>(callback);
  }

  async getData(): Promise<NewsFeed[]> {
    return this.request<NewsFeed[]>();
  }
}

export class NewsDetailApi extends Api {
  constructor(url: string) {
    super(url);
  }

  getDataWithXHR(callback: (data: NewsDetail) => void): void {
    this.getRequestWithXHR<NewsDetail>(callback);
  }

  getDataWithPromise(callback: (data: NewsDetail) => void): void {
    this.getRequestWithPromise<NewsDetail>(callback);
  }

  async getData(): Promise<NewsDetail> {
    return this.request<NewsDetail>();
  }
}