// Angular
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
// App services
import { AppConfig } from "../../app.config";
import { ALIGNMENT_ALGORITHMS } from "../../algorithms";
import { AlignmentParams, BlockParams, QueryParams } from "../../models";
import { MacroTracksService, MicroTracksService } from "../../services";

@Component({
  selector: "search-params",
  styleUrls: [ "./search-params.component.scss" ],
  templateUrl: "./search-params.component.html",
})
export class SearchParamsComponent implements OnDestroy, OnInit {

  // component IO
  @Output() invalid = new EventEmitter();
  @Output() valid = new EventEmitter();

  // UI state
  blockHelp = false;
  queryHelp = false;
  alignmentHelp = false;

  // form groups
  blockGroup: FormGroup;
  queryGroup: FormGroup;
  alignmentGroup: FormGroup;

  // form data
  sources = AppConfig.SERVERS.filter((s) => s.hasOwnProperty("microSearch"));
  algorithms = ALIGNMENT_ALGORITHMS;

  // emits when the component is destroyed
  private destroy: Subject<boolean>;

  // constructor
  constructor(private fb: FormBuilder,
              private macroTracksService: MacroTracksService,
              private microTracksService: MicroTracksService) {
    this.destroy = new Subject();
  }

  // Angular hooks

  ngOnInit(): void {
    // initialize block group and subscribe to store updates
    const defaultBlock = new BlockParams();
    this.blockGroup = this.fb.group(defaultBlock.formControls());
    this.macroTracksService.blockParams
      .pipe(takeUntil(this.destroy))
      .subscribe((params) => this._updateGroup(this.blockGroup, params));

    // initialize query group and subscribe to store updates
    const defaultQuery = new QueryParams();
    this.queryGroup  = this.fb.group(defaultQuery.formControls());
    this.microTracksService.queryParams
      .pipe(takeUntil(this.destroy))
      .subscribe((params) => this._updateGroup(this.queryGroup, params));

    // initialize alignment group and subscribe to store updates
    const defaultAlignment = new AlignmentParams();
    this.alignmentGroup  = this.fb.group(defaultAlignment.formControls());
    //this.alignmentService.alignmentParams
    //  .pipe(takeUntil(this.destroy))
    //  .subscribe((params) => this._updateGroup(this.alignmentGroup, params));

    // submit the updated form
    this.blockGroup.markAsDirty();
    this.queryGroup.markAsDirty();
    this.alignmentGroup.markAsDirty();
    this.submit();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }

  // public

  submit(): void {
    if (this.blockGroup.valid && this.queryGroup.valid && this.alignmentGroup.valid) {
      this.valid.emit();
      // submit block params
      this._submitGroup(this.blockGroup, (params) => {
        this.macroTracksService.updateParams(params);
      });
      // submit query params
      this._submitGroup(this.queryGroup, (params) => {
        this.microTracksService.updateParams(params);
      });
      // submit alignment params
      this._submitGroup(this.alignmentGroup, (params) => {
        //this.alignmentService.updateParams(params);
      });
    } else {
      this.invalid.emit();
    }
  }

  // private

  private _submitGroup(group, callback): void {
    if (group.dirty) {
      const params = group.getRawValue();
      callback(params);
      group.reset(params);
    }
  }

  private _updateGroup(group, params) {
    group.patchValue(params);
  }
}
