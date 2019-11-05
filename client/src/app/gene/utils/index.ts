import { CustomRouterStateSerializer } from './custom-router-state-serializer.util';
import { instantiateAndPopulate } from './instantiate-and-populate.util';
import { orderAlgorithmFactory, orderFilter } from './order-algorithm-factory.util';
import { regexpAlgorithmFactory, regexpFilter } from './regexp-algorithm-factory.util';
import { regexpOr } from './regexp-or.util';

export const utils: any[] = [
  CustomRouterStateSerializer,
  instantiateAndPopulate,
  orderAlgorithmFactory,
  orderFilter,
  regexpAlgorithmFactory,
  regexpFilter,
  regexpOr,
];

export * from './custom-router-state-serializer.util';
export * from './instantiate-and-populate.util';
export * from './order-algorithm-factory.util';
export * from './regexp-algorithm-factory.util';
export * from './regexp-or.util';