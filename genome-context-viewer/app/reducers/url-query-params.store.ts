import { ADD_QUERY_PARAMS } from '../constants/actions';

export const urlQueryParams = (state: any = {}, {type, payload}) => {
  switch (type) {
    case ADD_QUERY_PARAMS:
      return Object.assign({}, state, payload);
    default:
      return state;
  }
};
