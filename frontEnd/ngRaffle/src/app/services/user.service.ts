import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from '../../config';
import { RegistrationOtp } from '../models/registrationOtp';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(`${config.apiUrl}/users`);
  }

  register(user: any) {
    return this.http.post<RegistrationOtp>(`${config.apiUrl}/users/register`, user);
  }

  profileUpdate(data: any) {

    const jwt = JSON.parse(localStorage.getItem('currentUser') || "")['accessToken']

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${jwt}`
      }
    };

    return this.http.post<any>(`${config.apiUrl}/users/updateprofile`, data, headers);
  }

  verify(otp: RegistrationOtp) {
    return this.http.post<any>(`${config.apiUrl}/users/verify`, otp);
  }
  delete(id: string) {
    return this.http.delete(`${config.apiUrl}/users/${id}`);
  }
}