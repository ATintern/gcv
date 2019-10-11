// Angular
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
// store
import { Store } from '@ngrx/store';
import * as routerActions from '@gcv/core/store/actions/router.actions';
import * as fromRoot from '@gcv/reducers';
import * as fromRouter from '@gcv/gene/store/selectors/router/';
// app
import { ORDER_ALGORITHMS } from '@gcv/gene/algorithms';
import { Algorithm } from '@gcv/gene/models';
import { regexpAlgorithmFactory } from '@gcv/gene/utils';

@Injectable()
export class FilterService {
  orderAlgorithm: Observable<Algorithm>;
  regexpAlgorithm: Observable<Algorithm>;
  private orderSubject = new BehaviorSubject<Algorithm>(undefined);
  private regexpSubject = new BehaviorSubject<Algorithm>(undefined);

  private orderIDs = ORDER_ALGORITHMS.map(a => a.id);

  constructor(private store: Store<fromRoot.State>) {
    // order algorithm
    this.store.select(fromRouter.getOrder)
      .subscribe((order) => {
        const i = this.orderIDs.indexOf(order);
        if (i > -1) {
          this.orderSubject.next(ORDER_ALGORITHMS[i]);
        }
      });
    this.orderAlgorithm = this.orderSubject.asObservable().pipe(
      filter((order) => order !== undefined));
    // regexp algorithm
    this.store.select(fromRouter.getRegexp)
      .subscribe((regexp) => {
        this.regexpSubject.next(regexpAlgorithmFactory(regexp));
      });
    this.regexpAlgorithm = this.regexpSubject.asObservable().pipe(
      filter((regexp) => regexp !== undefined));
  }

  setOrder(order: string): void {
    const path = [];
    const query = Object.assign({}, {order});
    this.store.dispatch(new routerActions.Go({path, query}));
  }

  setRegexp(regexp: string): void {
    const path = [];
    const query = Object.assign({}, {regexp});
    this.store.dispatch(new routerActions.Go({path, query}));
  }
}
