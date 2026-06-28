import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  apiURL = 'http://localhost:3000';
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
  };

  constructor(private http: HttpClient) { }
 

  getPosts(): Observable<any> {
    return this.http.get(`${this.apiURL}/posts`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  getPost(id: number): Observable<any> {
    return this.http.get(`${this.apiURL}/posts/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  createPost(post: any): Observable<any> {
    return this.http.post(`${this.apiURL}/posts`, post, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  updatePost(id: number, post: any): Observable<any> {
    return this.http.put(`${this.apiURL}/posts/${id}`, post, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/posts/${id}`, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  getJsonPlaceholderPosts(): Observable<any> {
    return this.http.get('https://jsonplaceholder.typicode.com/posts').pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
 
  getJsonPlaceholderPost(id: number): Observable<any> {
    return this.http.get(`https://jsonplaceholder.typicode.com/posts/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
 
  createJsonPlaceholderPost(post: any): Observable<any> {
    return this.http.post('https://jsonplaceholder.typicode.com/posts', post, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
 
  updateJsonPlaceholderPost(id: number, post: any): Observable<any> {
    return this.http.put(`https://jsonplaceholder.typicode.com/posts/${id}`, post, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  deleteJsonPlaceholderPost(id: number): Observable<any> {
    return this.http.delete(`https://jsonplaceholder.typicode.com/posts/${id}`, this.httpOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error al procesar la solicitud';
    if (error.error instanceof ErrorEvent) {
      // *** Error del lado del Usuario ***
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // *** Error del lado del servidor ***
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error('Error en ApiService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}