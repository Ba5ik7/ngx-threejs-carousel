import { Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";



@Injectable({
  providedIn: 'root'
})
export class AppService {
  currentProject = new BehaviorSubject<number>(1);
  curentProject$ = this.currentProject.asObservable();
}