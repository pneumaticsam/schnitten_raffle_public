import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { config } from '../../config';
import { RaffleCheckData, RaffleCheckResponse } from '../models/raffleCheckData';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  constructor(private http: HttpClient) { }

  checkCode(codeData:RaffleCheckData) {
    console.log('about sending the data =>')
    console.log(codeData)

    const jwt = JSON.parse(localStorage.getItem('currentUser')||"")['accessToken']

    const headers= { headers: {
      'Content-Type': 'application/json',
      'Authorization':`bearer ${jwt}`
    }}
      return this.http
      .post<RaffleCheckResponse>
      (`${config.apiUrl}/raffle/check`, codeData, headers);
  }

  // delete(id: string) {
  //     return this.http.delete(`${config.apiUrl}/users/${id}`);
  // }
}
