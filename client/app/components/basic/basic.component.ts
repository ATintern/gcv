// Angular
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject }        from 'rxjs/BehaviorSubject';
import { Component,
         ElementRef,
         OnInit,
         ViewChild,
         ViewEncapsulation }      from '@angular/core';
import { Observable }             from 'rxjs/Observable';

// App
import { Alert }               from '../../models/alert.model';
import { ALERT_SUCCESS,
         ALERT_INFO,
         ALERT_WARNING,
         ALERT_DANGER }        from '../../constants/alerts';
import { AlertsService }       from '../../services/alerts.service';
import { Family }              from '../../models/family.model';
import { FilterService }       from '../../services/filter.service';
import { Gene }                from '../../models/gene.model';
import { Group }               from '../../models/group.model';
import { MicroTracks }         from '../../models/micro-tracks.model';
import { microTracksSelector } from '../../selectors/micro-tracks.selector';
import { MicroTracksService }  from '../../services/micro-tracks.service';

declare var d3: any;
declare var contextColors: any;
declare var Split: any;

enum AccordionTypes {
  REGEXP,
}

@Component({
  moduleId: module.id,
  selector: 'basic',
  templateUrl: 'basic.component.html',
  styleUrls: [ 'basic.component.css', '../../../assets/css/split.css' ],
  encapsulation: ViewEncapsulation.None
})

export class BasicComponent implements OnInit {
  // view children

  // EVIL: ElementRefs nested in switch cases are undefined when parent or child
  // AfterViewInit hooks are called, so routines that depend on them are called
  // via their setters.
  private _left: ElementRef;
  @ViewChild('left')
  set left(el: ElementRef) {
    this._left = el;
    this._splitViewers();
  }
  private _right: ElementRef;
  @ViewChild('right')
  set right(el: ElementRef) {
    this._right = el;
    this._splitViewers();
  }

  // UI

  selectedDetail;

  accordionTypes = AccordionTypes;
  accordion = null;

  private _showHelp = new BehaviorSubject<boolean>(true);
  showHelp = this._showHelp.asObservable();

  // data
  queryGenes: string[];

  private _microTracks: Observable<MicroTracks>;
  microTracks: MicroTracks;
  microLegend: any;

  // viewers
  microColors = contextColors;

  microArgs: any = {
    geneClick: function (g, track) {
      this.selectGene(g);
    }.bind(this),
    nameClick: function (t) {
      this.selectTrack(t);
    }.bind(this),
    autoResize: true
  };

  microLegendArgs: any;

  // constructor

  constructor(private _route: ActivatedRoute,
              private _alerts: AlertsService,
              private _filterService: FilterService,
              private _microTracksService: MicroTracksService) { }

  // Angular hooks

  private _onParams(params): void {
    this.invalidate();
    this.queryGenes = params['genes'].split(',');
    this.microArgs.highlight = this.queryGenes;
  }

  private _onMicroTracks(tracks): void {
    let num = tracks.groups.length;
    this._alerts.pushAlert(new Alert(
      (num) ? ALERT_SUCCESS : ALERT_WARNING,
      num + ' tracks returned'
    ));
    let highlight = tracks.groups.reduce((l, group) => {
      let families = group.genes
        .filter(g => this.queryGenes.indexOf(g.name) !== -1)
        .map(g => g.family);
      return l.concat(families);
    }, []);
    this.microLegendArgs = {
      autoResize: true,
      keyClick: function (f) {
        this.selectFamily(f);
      }.bind(this),
      highlight: highlight,
      selector: 'family'
    }
    this.microTracks = tracks;
    var seen = {};
    var uniqueFamilies = this.microTracks.families.reduce((l, f) => {
      if (!seen[f.id]) {
        seen[f.id] = true;
        l.push(f);
      } return l;
    }, []);
    var presentFamilies = this.microTracks.groups.reduce((l, group) => {
      return l.concat(group.genes.map(g => g.family));
    }, []);
    this.microLegend = uniqueFamilies.filter(f => {
      return presentFamilies.indexOf(f.id) != -1 && f.name != '';
    });
    this.hideLeftSlider();
  }

  ngOnInit(): void {
    this._route.params.subscribe(this._onParams.bind(this));
    this._microTracks = Observable.combineLatest(
      this._microTracksService.tracks,
      this._filterService.regexp
    ).let(microTracksSelector());
    this._microTracks.subscribe(this._onMicroTracks.bind(this));
  }

  // private

  private _splitViewers(): void {
    if (this._left !== undefined && this._right !== undefined) {
      let leftEl = this._left.nativeElement,
          rightEl = this._right.nativeElement;
      Split([leftEl, rightEl], {
        sizes: [70, 30],
        gutterSize: 8,
        cursor: 'col-resize',
        minSize: 0
      })
    }
  }

  // public

  invalidate(): void {
    this.microTracks = undefined;
  }

  // micro-synteny
  setAccordion(e: any, value: any): void {
    e.stopPropagation();
    this.accordion = this.accordion == value ? null : value;
  }

  // left slider
  // EVIL: typescript checks types at compile time so we have to explicitly
  // instantiate those that will be checked by left-slider at run-time

  hideLeftSlider(): void {
    this.selectedDetail = null;
  }

  selectParams(): void {
    this.selectedDetail = {};
  }

  selectGene(gene: Gene): void {
    let g = Object.assign(Object.create(Gene.prototype), gene);
    this.selectedDetail = g;
  }

  selectFamily(family: Family): void {
    let f = Object.assign(Object.create(Family.prototype), family);
    this.selectedDetail = f;
  }

  selectTrack(track: Group): void {
    let t = Object.assign(Object.create(Group.prototype), track);
    this.selectedDetail = t;
  }

  // help button
  help(): void {
    this._showHelp.next(true);
  }
}
