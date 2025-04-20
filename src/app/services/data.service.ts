import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSource = new BehaviorSubject<any[]>([]);
  data$ = this.dataSource.asObservable();

  setData(data: any[]) {
    this.dataSource.next(data);
  }

  getData(): any[] {
    return this.dataSource.getValue();
  }
}
