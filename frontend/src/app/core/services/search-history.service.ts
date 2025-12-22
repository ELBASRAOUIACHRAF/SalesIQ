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

  addUserSearchQuery(userId: number, query: string): Observable<SearchHistory>{
    return this.http.post<SearchHistory>(`${this.apiUrl}search/addSearch/${userId}`, query);
  }

  getUsersSearchHistory(userId: number): Observable<SearchHistory[]>{
    return this.http.get<SearchHistory[]>(`${this.apiUrl}search/searchQuery/${userId}`);
  }

  clearUsersHistory(userId: number): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}search/clearHistory/${userId}`);
  }

  deleteFromSearchHistory(SearchHistoryId: number): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}search/deleteSearch/${SearchHistoryId}`);
  }

  getRecentSearches(userId: number): Observable<any>{ 
    
    let params = new HttpParams().set('page', '0').set('size', '5'); 
    return this.http.get<any>(`${this.apiUrl}search/getRecentSearches/${userId}`, { params });
  }

}
