// Angular
import { Injectable } from "@angular/core";
// store
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs/observable/of";
import { catchError, map, scan, switchMap, withLatestFrom } from "rxjs/operators";
import * as alignedMicroTracksActions from "../actions/aligned-micro-tracks.actions";
import * as microTracksActions from "../actions/micro-tracks.actions";
import * as searchQueryTrackActions from "../actions/search-query-track.actions";
import * as fromRoot from "../reducers";
import * as fromAlignedMicroTracks from "../reducers/aligned-micro-tracks.store";
import * as fromRouter from "../reducers/router.store";
import * as fromSearchQueryTrack from "../reducers/search-query-track.store";
// services
import { AlignmentService } from "../services/alignment.service";

@Injectable()
export class AlignmentEffects {

  constructor(private actions$: Actions,
              private alignmentService: AlignmentService,
              private store: Store<fromRoot.State>) { }

  // pairwise

  @Effect()
  getSearchTracks$ = this.actions$.pipe(
    ofType(microTracksActions.GET_SEARCH),
    map((action: microTracksActions.GetSearch) => action.payload),
    switchMap(({query, params, sources}) => {
      return this.alignmentService.getPairwiseReference(query).pipe(
        map((reference) => new alignedMicroTracksActions.Init({reference}))
      )
    })
  );

  @Effect()
  getSearchTracksSuccess$ = this.actions$.pipe(
    ofType(microTracksActions.GET_SEARCH_SUCCESS),
    map((action: microTracksActions.GetSearchSuccess) => action.payload.tracks),
    withLatestFrom(this.store.select(fromRouter.getMicroAlignmentParams)),
    map(([tracks, params]) => {
      return new alignedMicroTracksActions.GetPairwise({tracks, params});
    })
  );

  @Effect()
  getPairwiseAlignment$ = this.actions$.pipe(
    ofType(alignedMicroTracksActions.GET_PAIRWISE),
    map((action: alignedMicroTracksActions.GetPairwise) => action.payload),
    withLatestFrom(
      this.store.select(fromAlignedMicroTracks.getAlignmentReference)
      .filter((reference) => reference !== undefined)
    ),
    switchMap(([{tracks, params}, reference]) => {
      return this.alignmentService.getPairwiseAlignment(reference, tracks, params).pipe(
        map(tracks => new alignedMicroTracksActions.GetPairwiseSuccess({tracks})),
      );
    })
  )

  // multi

  @Effect()
  getMultipleAlignment$ = this.actions$.pipe(
    ofType(alignedMicroTracksActions.GET_MULTI),
    map((action: alignedMicroTracksActions.GetMulti) => action.payload),
    switchMap(({tracks}) => {
      return this.alignmentService.getMultipleAlignment(tracks).pipe(
        map(tracks => new alignedMicroTracksActions.GetMultiSuccess({tracks})),
      );
    })
  )
}
