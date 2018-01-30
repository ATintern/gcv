// block parameters
export const enum DefaultBlockParams {
  DEFAULT_MATCHED      = 20,
  DEFAULT_INTERMEDIATE = 10,
  DEFAULT_MASK         = 10
}

// query parameters
export const enum DefaultQueryParams {
  DEFAULT_NEIGHBORS    = 20,
  DEFAULT_MATCHED      = 4,
  DEFAULT_INTERMEDIATE = 5,
  DEFAULT_SOURCE       = 'lfo'
}

// alignment parameters
export const enum DefaultAlignmentParams {
  DEFAULT_ALIGNMENT = 'smith-waterman',
  DEFAULT_MATCH     = 10,
  DEFAULT_MISMATCH  = -1,
  DEFAULT_GAP       = -1,
  DEFAULT_SCORE     = 30,
  DEFAULT_THRESHOLD = 25
}

// clustering parameters
export const enum DefaultClusteringParams {
  DEFAULT_ALPHA   = 0.85,
  DEFAULT_KAPPA   = 10,
  DEFAULT_MINSUP  = 2,
  DEFAULT_MINSIZE = 5
}
