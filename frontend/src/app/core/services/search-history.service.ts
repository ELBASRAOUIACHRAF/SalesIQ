import { HttpClient } from '@angular/common/http';
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

}
