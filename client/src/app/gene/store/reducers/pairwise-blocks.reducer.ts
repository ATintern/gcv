// A PairwiseBlock is a syntenic block defined between two chromosomes. A
// PairwiseBlocks is a collection of these blocks. This file contains an NgRx
// reducer and selectors for storing and accessing PairwiseBlocks. Specifically,
// syntenic blocks are loaded as PairwiseBlocks for each chromosome loaded for
// the genes provided by the user (see ./chromosome.reducer.ts). These
// PairwiseBlocks are stored by the pairwise-blocks reducer and made available
// via selectors.

// NgRx
import { createEntityAdapter, EntityState } from '@ngrx/entity';
// stpre
import * as pairwiseBlocksActions from '@gcv/gene/store/actions/pairwise-blocks.actions';
// app
import { PairwiseBlocks } from '@gcv/gene/models';

declare var Object: any;  // because TypeScript doesn't support Object.values

export const pairwiseBlocksFeatureKey = 'pairwiseblocks';

export type PairwiseBlocksID = {
  reference: string,
  referenceSource: string,
  chromosome: string,
  chromosomeSource: string
};

export type PartialPairwiseBlocksID = {
  reference: string,
  referenceSource: string,
  source: string
};

const pairwiseBlocksID = (reference: string, referenceSource: string,
chromosome: string, chromosomeSource: string) => {
  return `${reference}:${referenceSource}:${chromosome}:${chromosomeSource}`;
};

export function partialPairwiseBlocksID(reference: string,
  referenceSource: string, source: string): string;
export function partialPairwiseBlocksID({reference, referenceSource, source}): string;
export function partialPairwiseBlocksID(...args): string {
  if (typeof args[0] === 'object') {
    const id = args[0];
    return partialPairwiseBlocksID(id.reference, id.referenceSource, id.source);
  }
  const [reference, referenceSource, source] = args;
  return `${reference}:${referenceSource}:${source}`;
};

const adapter = createEntityAdapter<PairwiseBlocks>({
  selectId: (e) => pairwiseBlocksID(e.reference, e.referenceSource,
    e.chromosome, e.chromosomeSource)
});

// TODO: is loaded even necessary or can it be derived from entity ids and
// selectChromosomeIDs selector?
export interface State extends EntityState<PairwiseBlocks> {
  failed: PartialPairwiseBlocksID[];
  loaded: PartialPairwiseBlocksID[];
  loading: PartialPairwiseBlocksID[];
}

export const initialState: State = adapter.getInitialState({
  failed: [],
  loaded: [],
  loading: [],
});

export function reducer(
  state = initialState,
  action: pairwiseBlocksActions.Actions
): State {
  switch (action.type) {
    case pairwiseBlocksActions.CLEAR:
      // TODO: can we just return the initial state?
      return adapter.removeAll({
        ...state,
        failed: [],
        loaded: [],
        loading: [],
      });
    case pairwiseBlocksActions.GET:
      const chromosome = action.payload.chromosome;
      const source = action.payload.source;
      const partialID = {
          reference: chromosome.name,
          referenceSource: chromosome.source,
          source,
        };
      return {
        ...state,
        loading: state.loading.concat([partialID]),
      };
    case pairwiseBlocksActions.GET_SUCCESS:
    {
      const chromosome = action.payload.chromosome;
      const source = action.payload.source;
      const blocks = action.payload.blocks;
      const partialID = {
          reference: chromosome.name,
          referenceSource: chromosome.source,
          source,
        };
      return adapter.addMany(
        blocks,
        {
          ...state,
          loaded: state.loaded.concat(partialID),
          loading: state.loading.filter(
          ({reference, referenceSource, source}) => {
            return !(reference === partialID.reference &&
                     referenceSource === partialID.referenceSource &&
                     source === partialID.source);
          }),
        },
      );
    }
    case pairwiseBlocksActions.GET_FAILURE:
    {
      const chromosome = action.payload.chromosome;
      const source = action.payload.source;
      const partialID = {
          reference: chromosome.name,
          referenceSource: chromosome.source,
          source,
        };
      return {
        ...state,
        failed: state.failed.concat(partialID),
        loading: state.loading.filter(
        ({reference, referenceSource, source}) => {
          return !(reference === partialID.reference &&
                   referenceSource === partialID.referenceSource &&
                   source === partialID.source);
        }),
      };
    }
    default:
      return state;
  }
}