import { NewsFeed, NewsDetail } from '../types';

export class Api {
  xhr: XMLHttpRequest;
  url: string;

  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
  }

  // 기존 XmlHttpReauest 방식
  getRequestWithXHR<AjaxResponse>(callback: (data: AjaxResponse) => void): void {
    this.xhr.open('GET', this.url);
    this.xhr.addEventListener("load", () => {
      callback(JSON.parse(this.xhr.response) as AjaxResponse);
    });
    this.xhr.send();
  }

  // Promise, fetch 적용
  getRequestWithPromise<AjaxResponse>(callback: (data: AjaxResponse) => void): void {
    // JSON.parse 는 동기로 작동하는데, fetch는 response.json()로 parse를 비동기로 실행시킨다.
    fetch(this.url)
      .then(response => response.json())
      .then(callback)
      .catch(() => console.log("데이터를 불러오지 못했습니다."));
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
}