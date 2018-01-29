import { Validators }           from '@angular/forms';
import { ALIGNMENT_ALGORITHMS } from '../constants/alignment-algorithms';
import { Regex }                from '../constants/regex';

export class AlignmentParams {
  private _algorithms: string = ALIGNMENT_ALGORITHMS.map(a => a.id).join('|');

  constructor(
    public algorithm: string = 'repeat',  // Algorithm ID
    public match: number     = 10,
    public mismatch: number  = -1,
    public gap: number       = -1,
    public score: number     = 30,
    public threshold: number = 25
  ) { }

  formControls(): any {
    return {
      algorithm: [this.algorithm, Validators.compose([
        Validators.required,
        Validators.pattern(this._algorithms)
      ])],
      match: [this.match, Validators.compose([
        Validators.required,
        Validators.pattern(Regex.POSITIVE_INT)
      ])],
      mismatch: [this.mismatch, Validators.compose([
        Validators.required,
        Validators.pattern(Regex.NEGATIVE_INT)
      ])],
      gap: [this.gap, Validators.compose([
        Validators.required,
        Validators.pattern(Regex.NEGATIVE_INT)
      ])],
      score: [this.score, Validators.compose([
        Validators.required,
        Validators.pattern(Regex.POSITIVE_INT)
      ])],
      threshold: [this.threshold, Validators.compose([
        Validators.required,
        Validators.pattern(Regex.POSITIVE_INT)
      ])]
    };
  }
}
