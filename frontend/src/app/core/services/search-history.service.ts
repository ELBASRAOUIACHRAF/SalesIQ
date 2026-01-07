import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchHistory } from '../models/searchHistory.model';

@Injectable({
  providedIn: 'root',
})
export class SearchHistoryService {
  
  private apiUrl = 'http://localhost:8080/'; 

  constructor(private http: HttpClient) { }

  addUserSearchQuery(query: string): Observable<SearchHistory | null>{
    return this.http.post<any>(`${this.apiUrl}search/addSearch`, query);
  }

  getUsersSearchHistory(): Observable<SearchHistory[] | null>{
    return this.http.get<any>(`${this.apiUrl}search/searchQuery`);
  }

  clearUsersHistory(): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}search/clearHistory`);
  }

  deleteFromSearchHistory(SearchHistoryId: number): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}search/deleteSearch/${SearchHistoryId}`);
  }

  getRecentSearches(): Observable<any>{ 
    let params = new HttpParams().set('page', '0').set('size', '5'); 
    return this.http.get<any>(`${this.apiUrl}search/getRecentSearches`, { params });
  }

}
