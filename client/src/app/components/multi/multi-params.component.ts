// Angular
import { Component,
         EventEmitter,
         Input,
         OnChanges,
         OnDestroy,
         OnInit,
         Output,
         SimpleChanges }          from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable }             from 'rxjs/Observable';

// App
import { Alert }                  from '../../models/alert.model';
import { Alerts }                 from '../../constants/alerts';
import { AlertsService }          from '../../services/alerts.service';
import { AppConfig }              from '../../app.config';
import { ClusteringParams }       from '../../models/clustering-params.model';
import { ClusteringService }      from '../../services/clustering.service';
import { DefaultClusteringParams,
         DefaultQueryParams }     from '../../constants/default-parameters';
import { MicroTracksService }     from '../../services/micro-tracks.service';
import { QueryParams }            from '../../models/query-params.model';
//import { UrlService }             from '../../services/url-query-params.service';

@Component({
  moduleId: module.id.toString(),
  selector: 'multi-params',
  templateUrl: 'multi-params.component.html',
  styleUrls: [ 'multi-params.component.css' ]
})

//export class MultiParamsComponent implements OnChanges, OnDestroy, OnInit {
export class MultiParamsComponent implements OnInit {
  // IO
  @Input() queryGenes: string[];
  @Output() invalid = new EventEmitter();
  @Output() submitted = new EventEmitter();

  // UI

  help = false;

  // data

  queryGroup: FormGroup;
  clusteringGroup: FormGroup;

  sources = AppConfig.SERVERS.filter(s => s.hasOwnProperty('microMulti'));

  //private _sub: any;

  // constructor

  constructor(private _alerts: AlertsService,
              private _clusteringService: ClusteringService,
              private _fb: FormBuilder,
              private _microTracksService: MicroTracksService) { }

  // Angular hooks

  //ngOnChanges(changes: SimpleChanges): void {
  //  if (this.queryGroup !== undefined)
  //    this._multiQuery();
  //}

  //ngOnDestroy(): void {
  //  this._sub.unsubscribe();
  //}

  ngOnInit(): void {
    // initialize query group and subscribe to store updates
    let defaultQuery = new QueryParams();
    this.queryGroup = this._fb.group(defaultQuery.formControls());
    this._microTracksService.queryParams.subscribe(params => {
      this._updateGroup(this.queryGroup, params);
    });

    // initialize clustering group and subscribe to store updates
    let defaultClustering = new ClusteringParams();
    this.clusteringGroup = this._fb.group(defaultClustering.formControls());
    this._clusteringService.clusteringParams.subscribe(params => {
      this._updateGroup(this.queryGroup, params);
    });

    // subscribe to url query param updates
    //this._sub = this._url.params.subscribe(params => {
    //  let oldQuery = this.queryGroup.getRawValue();
    //  this.queryGroup.patchValue(params);
    //  let newQuery = this.queryGroup.getRawValue();
    //  if (JSON.stringify(oldQuery) !== JSON.stringify(newQuery))
    //    this.queryGroup.markAsDirty();
    //  let oldClustering = this.clusteringGroup.getRawValue();
    //  this.clusteringGroup.patchValue(params);
    //  let newClustering = this.clusteringGroup.getRawValue();
    //  if (JSON.stringify(oldClustering) !== JSON.stringify(newClustering))
    //    this.clusteringGroup.markAsDirty();
    //  if (this.queryGroup.dirty || this.clusteringGroup.dirty)
    //    this.submit();
    //});
    // submit the updated form
    this.queryGroup.markAsDirty();
    this.clusteringGroup.markAsDirty();
    this.submit();
  }

  // private

  private _updateGroup(group, params) {
    group.patchValue(params);
  }

  //private _multiQuery(): void {
  //  this._microTracksService.multiQuery(
  //    this.queryGenes,
  //    this.queryGroup.getRawValue(),
  //    e => this._alerts.pushAlert(new Alert(Alerts.ALERT_DANGER, e))
  //  );
  //}

  private _submitGroup(group, callback=params=>{}): void {
    if (group.dirty) {
      //this.submitted.emit();
      let params = group.getRawValue();
      callback(params);
      group.reset(params);
      //this._url.updateParams(Object.assign({}, params));
    }
  }

  // public

  submit(): void {
    if (this.queryGroup.valid && this.clusteringGroup.valid) {
      // submit query params
      this._submitGroup(this.queryGroup, params => {
        this._microTracksService.updateParams(params);
      });
      // submit clustering params
      this._submitGroup(this.clusteringGroup, params => {
        this._clusteringService.updateParams(params);
      });
    } else {
      this.invalid.emit();
    }
  }
}
