// Angular
import { BehaviorSubject }        from 'rxjs/BehaviorSubject';
import { Component,
         EventEmitter,
         Input,
         OnChanges,
         OnDestroy,
         OnInit,
         Output,
         SimpleChanges }          from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// App services
import { ALIGNMENT_ALGORITHMS }  from '../../constants/alignment-algorithms';
import { AlignmentParams }       from '../../models/alignment-params.model';
import { AlignmentService }      from '../../services/alignment.service';
import { MicroTracksService }    from '../../services/micro-tracks.service';
import { QueryParams }           from '../../models/query-params.model';
import { SERVERS }               from '../../constants/servers';
import { UrlQueryParamsService } from '../../services/url-query-params.service';

@Component({
  moduleId: module.id,
  selector: 'search-params',
  templateUrl: 'search-params.component.html',
  styleUrls: [ 'search-params.component.css' ]
})

export class SearchParamsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() source: string;
  @Input() gene: string;
  @Output() invalid = new EventEmitter();
  @Output() submitted = new EventEmitter();

  queryHelp = false;
  alignmentHelp = false;

  queryGroup: FormGroup;
  alignmentGroup: FormGroup;

  sources = SERVERS.filter(s => s.hasOwnProperty('microSearch'));
  algorithms = ALIGNMENT_ALGORITHMS;

  private _sub: any;

  constructor(private _alignmentService: AlignmentService,
              private _fb: FormBuilder,
              private _tracksService: MicroTracksService,
              private _url: UrlQueryParamsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.queryGroup !== undefined)
      this._geneSearch();
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }

  ngOnInit(): void {
    // initialize forms
    let defaultQuery = new QueryParams(5, ['lis'], 2, 2);
    this.queryGroup = this._fb.group(defaultQuery.formControls());
    let defaultAlignment = new AlignmentParams('repeat', 3, -1, -1, 25, 10)
    this.alignmentGroup = this._fb.group(defaultAlignment.formControls());
    // subscribe to url query param updates
    this._sub = this._url.params.subscribe(params => {
      let oldQuery = this.queryGroup.getRawValue();
      this.queryGroup.patchValue(params);
      let newQuery = this.queryGroup.getRawValue();
      if (JSON.stringify(oldQuery) !== JSON.stringify(newQuery))
        this.queryGroup.markAsDirty();
      let oldAlignment = this.alignmentGroup.getRawValue();
      this.alignmentGroup.patchValue(params);
      let newAlignment = this.alignmentGroup.getRawValue();
      if (JSON.stringify(oldAlignment) !== JSON.stringify(newAlignment))
        this.alignmentGroup.markAsDirty();
      if (this.queryGroup.dirty || this.alignmentGroup.dirty)
        this.submit();
    });
    // submit the updated form
    this.queryGroup.markAsDirty();
    this.alignmentGroup.markAsDirty();
    this.submit();
  }

  private _geneSearch(): void {
    this._tracksService.geneSearch(
      this.source,
      this.gene,
      this.queryGroup.getRawValue()
    );
  }

  submit(): void {
    if (this.queryGroup.valid && this.alignmentGroup.valid) {
      if (this.queryGroup.dirty) {
        this.submitted.emit();
        let params = this.queryGroup.getRawValue();
        this._geneSearch();
        this.queryGroup.reset(params);
        this._url.updateParams(Object.assign({}, params));
      }
      if (this.alignmentGroup.dirty) {
        this.submitted.emit();
        let params = this.alignmentGroup.getRawValue();
        this._alignmentService.updateParams(params);
        this.alignmentGroup.reset(params);
        this._url.updateParams(Object.assign({}, params));
      }
    } else {
      this.invalid.emit();
    }
  }
}
