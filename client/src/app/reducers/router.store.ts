import { Params } from "@angular/router";
import * as fromRouterStore from "@ngrx/router-store";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AlignmentParams } from "../models/alignment-params.model";
import { BlockParams } from "../models/block-params.model";
import { ClusteringParams } from "../models/clustering-params.model";
import { QueryParams } from "../models/query-params.model";
import { instantiateAndPopulate } from "../utils/instantiate-and-populate.util";

export interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export const initialState: {state: RouterStateUrl, navigationId: number} = {
  state: {
    url: window.location.pathname,
    params: {},
    queryParams: {}
  },
  navigationId: 0,
}

export const getRouterState = createFeatureSelector
  <fromRouterStore.RouterReducerState<RouterStateUrl>>("router");

export const getParams = createSelector(
  getRouterState,
  (route) => route.state.params,
);

export const getSearchRoute = createSelector(
  getRouterState,
  (route) => {
    const params = route.state.params;
    return {source: params.source, gene: params.gene};
  },
);

export const getSearchRouteSource = createSelector(
  getRouterState,
  (route) => route.state.params.source,
);

export const getMultiRoute = createSelector(
  getRouterState,
  (route) => {
    const params = route.state.params;
    return {genes: params.genes};
  },
);

export const getQueryParams = createSelector(
  getRouterState,
  (route) => route && route.state.queryParams,
);

// app parameters encoded in route query params
export const getMicroQueryParams = createSelector(
  getQueryParams,
  (params) => instantiateAndPopulate(QueryParams, params),
)

export const getMicroQueryParamNeighbors = createSelector(
  getMicroQueryParams,
  (params) => params.neighbors,
)

export const getMicroQueryParamSources = createSelector(
  getMicroQueryParams,
  (params) => params.sources,
)

export const getMicroAlignmentParams = createSelector(
  getQueryParams,
  (params) => instantiateAndPopulate(AlignmentParams, params || {}),
)

export const getMacroBlockParams = createSelector(
  getQueryParams,
  (params) => instantiateAndPopulate(BlockParams, params || {}),
)
export const getMicroClusteringParams = createSelector(
  getQueryParams,
  (params) => instantiateAndPopulate(ClusteringParams, params || {}),
)
