import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileModel } from '../models/profile.model';


@Injectable({
  providedIn: 'root',
})
export class UsersService {
  
  private apiUrl = 'http://localhost:8080/'; 

  constructor(private http: HttpClient) { }

  getUsersProfile(usersId: number): Observable<ProfileModel>{
    return this.http.get<ProfileModel>(`${this.apiUrl}profile/${usersId}`);
  }

  updateUserProfile(profileData: ProfileModel): Observable<ProfileModel>{
    return this.http.put<ProfileModel>(`${this.apiUrl}profileUpdate`, profileData);
  }


}
