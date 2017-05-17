// Angular
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject }        from 'rxjs/BehaviorSubject';
import { Component,
         ElementRef,
         OnInit,
         QueryList,
         ViewChild,
         ViewChildren,
         ViewEncapsulation }      from '@angular/core';
import { Observable }             from 'rxjs/Observable';

// App
import { Alert }               from '../../models/alert.model';
import { ALERT_SUCCESS,
         ALERT_INFO,
         ALERT_WARNING,
         ALERT_DANGER }        from '../../constants/alerts';
import { AlertsService }       from '../../services/alerts.service';
import { AlignmentService }    from '../../services/alignment.service';
import { Family }              from '../../models/family.model';
import { FilterService }       from '../../services/filter.service';
import { Gene }                from '../../models/gene.model';
import { Group }               from '../../models/group.model';
import { MacroTracks }         from '../../models/macro-tracks.model';
import { macroTracksSelector } from '../../selectors/macro-tracks.selector';
import { MacroTracksService }  from '../../services/macro-tracks.service';
import { MicroTracks }         from '../../models/micro-tracks.model';
import { microTracksSelector } from '../../selectors/micro-tracks.selector';
import { MicroTracksService }  from '../../services/micro-tracks.service';
import { PlotComponent }       from '../shared/plot.component';
import { plotsSelector }       from '../../selectors/plots.selector';
import { PlotsService }        from '../../services/plots.service';

declare var d3: any;
declare var contextColors: any;
declare var taxonChroma: any;
declare var Split: any;
declare var getFamilySizeMap: any;
declare var RegExp: any;  // TypeScript doesn't support regexp as argument...
declare var parseInt: any;  // TypeScript doesn't recognize number inputs

enum ContentTypes {
  VIEWERS,
  PLOTS
}

enum PlotTypes {
  LOCAL,
  GLOBAL
}

enum AccordionTypes {
  REGEXP,
  ORDER,
  SCROLL
}

@Component({
  moduleId: module.id,
  selector: 'search',
  templateUrl: 'search.component.html',
  styleUrls: [ 'search.component.css', '../../../assets/css/split.css' ],
  encapsulation: ViewEncapsulation.None
})

export class SearchComponent implements OnInit {
  // view children

  // EVIL: ElementRefs nested in switch cases are undefined when parent or child
  // AfterViewInit hooks are called, so routines that depend on them are called
  // via their setters.
  private _splitSizes = {
		left: 70,
    right: 30,
    topLeft: 50,
    bottomLeft: 50,
    topRight: 50,
    bottomRight: 50
  };
  private _left: ElementRef;
  @ViewChild('left')
  set left(el: ElementRef) {
    this._left = el;
    this._splitViewers();
  }
  private _topLeft: ElementRef;
  @ViewChild('topLeft')
  set topLeft(el: ElementRef) {
    this._topLeft = el;
    this._splitViewers();
  }
  private _bottomLeft: ElementRef;
  @ViewChild('bottomLeft')
  set bottomLeft(el: ElementRef) {
    this._bottomLeft = el;
    this._splitViewers();
  }
  private _right: ElementRef;
  @ViewChild('right')
  set right(el: ElementRef) {
    this._right = el;
    this._splitViewers();
  }
  private _topRight: ElementRef;
  @ViewChild('topRight')
  set topRight(el: ElementRef) {
    this._topRight = el;
    this._splitViewers();
  }
  private _bottomRight: ElementRef;
  @ViewChild('bottomRight')
  set bottomRight(el: ElementRef) {
    this._bottomRight = el;
    this._splitViewers();
  }

  @ViewChildren(PlotComponent) plotComponents: QueryList<PlotComponent>;

  // UI

  contentTypes = ContentTypes;
  selectedContent;

  plotTypes = PlotTypes;
  showLocalGlobalPlots: boolean;
  selectedPlot;

  selectedDetail;

  accordionTypes = AccordionTypes;
  accordion = this.accordionTypes.SCROLL;

  private _showHelp = new BehaviorSubject<boolean>(true);
  showHelp = this._showHelp.asObservable();

  macroConfig = {
    order: true,
    filter: false
  }

  // data

  routeSource: string;
  routeGene: string;

  private _microTracks: Observable<MicroTracks>;
  microTracks: MicroTracks;
  microLegend: any;
  queryGenes: Gene[];

  private _microPlots: Observable<MicroTracks>;
  microPlots: MicroTracks;

  private _macroTracks: Observable<MacroTracks>;
  macroLegend: any;
  macroTracks: MacroTracks;

  selectedLocal: Group;
  selectedGlobal: Group;

  private _numReturned: number;

  // viewers

  microColors = contextColors;
  macroColors = function (s) { return taxonChroma.get(s) };

  microArgs: any;
  microLegendArgs: any;
  macroArgs: any;
  macroLegendArgs: any;

  plotArgs: any;

  // constructor

  constructor(private _route: ActivatedRoute,
              private _alerts: AlertsService,
              private _alignmentService: AlignmentService,
              private _filterService: FilterService,
              private _macroTracksService: MacroTracksService,
              private _microTracksService: MicroTracksService,
              private _plotsService: PlotsService,
              private _router: Router) { }

  // Angular hooks

  private _initUI(): void {
    this.showViewers();
    this.showLocalPlot();
    this.hideLocalGlobalPlots();
  }

  private _onParams(params): void {
    this.invalidate();
    this.hideLocalGlobalPlots();
    this.routeSource = params['source'];
    this.routeGene = params['gene'];
  }

  private _onRawMicroTracks(tracks): void {
    this._numReturned = tracks.groups.length - 1;  // exclude query
    this._macroTracksService.search(tracks);
  }


  private _onAlignedMicroTracks(tracks): void {
    if (tracks.groups.length > 0 && tracks.groups[0].genes.length > 0) {
      // alert how many tracks were returned
      let num = (new Set(tracks.groups.map(g => g.id))).size - 1;
      this._alerts.pushAlert(new Alert(
        (num) ? ((this._numReturned == num) ? ALERT_SUCCESS : ALERT_INFO) :
          ALERT_WARNING,
        this._numReturned + ' tracks returned; ' + num + ' aligned'
      ));
      // only selectively color when there are results
      let familySizes = (tracks.groups.length > 1)
                      ? getFamilySizeMap(tracks)
                      : undefined;

      let i = tracks.groups[0].genes.map(g => g.name).indexOf(this.routeGene);
      let focus = tracks.groups[0].genes[i];
      this.microLegendArgs = {
        autoResize: true,
        keyClick: function (f) {
          this.selectFamily(f);
        }.bind(this),
        highlight: [focus.family],
        selectiveColoring: familySizes,
        selector: 'family'
      };

      this.macroLegendArgs = {
        autoResize: true,
        highlight: [focus.family],
        selector: 'genus-species'
      };

      this.plotArgs = {
        autoResize: true,
        geneClick: function (g, track) {
          this.selectGene(g);
        }.bind(this),
        outlier: -1,
        plotClick: function (p) {
          this.selectPlot(p);
        }.bind(this),
        selectiveColoring: familySizes
	    }

      this.microArgs = {
        autoResize: true,
        boldFirst: true,
        geneClick: function (g, track) {
          this.selectGene(g);
        }.bind(this),
        highlight: [this.routeGene],
        plotClick: function (p) {
          this.selectPlot(p);
        }.bind(this),
        nameClick: function (t) {
          this.selectTrack(t);
        }.bind(this),
        selectiveColoring: familySizes
      };

      this.queryGenes = tracks.groups[0].genes;
      this.macroArgs = {
        autoResize: true,
        viewport: {
          start: this.queryGenes[0].fmin,
          stop: this.queryGenes[this.queryGenes.length - 1].fmax
        },
        viewportDrag: function (d1, d2) {
          this._viewportDrag(d1, d2);
        }.bind(this),
        highlight: tracks.groups.map(t => t.chromosome_name),
        colors: this.macroColors
      };

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
    }
    this.hideLeftSlider();
  }

  private _onPlots(plots): void { this.microPlots = plots; }

  private _onPlotSelection(plot): void {
    this.selectedLocal = this.selectedGlobal = undefined;
    if (this.selectedPlot == this.plotTypes.GLOBAL) this.showGlobalPlot();
    else this.showLocalPlot();
  }

  private _onMacroTracks(tracks): void {
    this.macroTracks = tracks;
    if (tracks !== undefined) {
      var seen = {};
      this.macroLegend = tracks.tracks.reduce((l, t) => {
        let name = t.genus + ' ' + t.species;
        if (!seen[name]) {
          seen[name] = true;
          l.push({name: name, id: name});
        } return l;
      }, [])
    }
  }

  private _subscribeToMacro(): void {
    if (this._macroSub !== undefined)
      this._macroSub.unsubscribe();
    this._macroSub = this._macroTracks
      .let(macroTracksSelector(this.macroConfig.filter, this.macroConfig.order))
      .subscribe(this._onMacroTracks.bind(this));
  }

  ngOnInit(): void {
    // initialize UI
    this._initUI();

    // subscribe to parameter changes
    this._route.params.subscribe(this._onParams.bind(this));

    // subscribe to micro-tracks changes
    this._microTracksService.tracks.subscribe(this._onRawMicroTracks.bind(this));
    this._microTracks = Observable.combineLatest(
      this._alignmentService.tracks,
      this._filterService.regexp,
      this._filterService.order
    ).let(microTracksSelector({skipFirst: true}));
    this._microTracks.subscribe(this._onAlignedMicroTracks.bind(this));

    // subscribe to micro-plots changes
    this._microPlots = Observable.combineLatest(
      this._plotsService.localPlots,
      this._microTracks,
    ).let(plotsSelector());
    this._microPlots.subscribe(this._onPlots.bind(this));
    this._plotsService.selectedPlot.subscribe(this._onPlotSelection.bind(this));

    // subscribe to macro-track changes
    this._macroTracks = Observable.combineLatest(
      this._macroTracksService.tracks,
      this._microTracks
    )
    this._subscribeToMacro();
  }

  // private

  private _errorAlert(message: string): void {
    this._alerts.pushAlert(new Alert(ALERT_DANGER, message));
  }

  private _splitViewers(): void {
    if (this._left !== undefined &&
        this._topLeft !== undefined &&
        this._bottomLeft !== undefined &&
        this._right !== undefined &&
        this._topRight !== undefined &&
        this._bottomRight !== undefined) {
      let parseWidth = (el): number => {
        let regexp = new RegExp(/calc\(|\%(.*)/, 'g');
        return parseFloat(el.style.width.replace(regexp, ''));
      }
      let parseHeight = (el): number => {
        let regexp = new RegExp(/calc\(|\%(.*)/, 'g');
        return parseFloat(el.style.height.replace(regexp, ''));
      }
      let leftEl = this._left.nativeElement,
          topLeftEl = this._topLeft.nativeElement,
          bottomLeftEl = this._bottomLeft.nativeElement,
          rightEl = this._right.nativeElement,
          topRightEl = this._topRight.nativeElement,
          bottomRightEl = this._bottomRight.nativeElement;
      Split([leftEl, rightEl], {
        sizes: [this._splitSizes.left, this._splitSizes.right],
        gutterSize: 8,
        cursor: 'col-resize',
        minSize: 0,
        onDragEnd: () => {
          this._splitSizes.left = parseWidth(leftEl);
          this._splitSizes.right = parseWidth(rightEl);
        }
      })
      Split([topLeftEl, bottomLeftEl], {
        sizes: [this._splitSizes.topLeft, this._splitSizes.bottomLeft],
        direction: 'vertical',
        gutterSize: 8,
        cursor: 'row-resize',
        minSize: 0,
        onDragEnd: () => {
          this._splitSizes.topLeft = parseHeight(topLeftEl);
          this._splitSizes.bottomLeft = parseHeight(bottomLeftEl);
        }
      })
      Split([topRightEl, bottomRightEl], {
        sizes: [this._splitSizes.topRight, this._splitSizes.bottomRight],
        direction: 'vertical',
        gutterSize: 8,
        cursor: 'row-resize',
        minSize: 0,
        onDragEnd: () => {
          this._splitSizes.topRight = parseHeight(topRightEl);
          this._splitSizes.bottomRight = parseHeight(bottomRightEl);
        }
      })
    }
  }

  private _viewportDrag(d1, d2): void {
    let server = this.routeSource;
    let chromosome = (this.microTracks.groups.length)
                   ? this.microTracks.groups[0].chromosome_id
                   : undefined;
    let position = parseInt((d1 + d2) / 2);
    if (server !== undefined && chromosome !== undefined) {
      let macroBack = this.macroTracks;
      this.macroTracks = undefined;
      this._macroTracksService.nearestGene(
        server,
        chromosome,
        position,
        function(tracks, g) {
          this.macroTracks = tracks;
          this._router.navigateByUrl('/search/' + server + '/' + g.name);
        }.bind(this, macroBack),
        function (tracks, m) {
          this.macroTracks = tracks;
          this._errorAlert(m);
        }.bind(this, macroBack)
      );
    }
  }

  // public

  invalidate(): void {
    this.microTracks = this.microLegend = undefined;
    this.macroTracks = this.macroLegend = undefined;
    this.microPlots = undefined;
  }

  // micro-synteny
  setAccordion(e: any, value: any): void {
    e.stopPropagation();
    this.accordion = (this.accordion == value) ? null : value;
  }

  // main content

  drawPlots(): void {
    this.plotComponents.forEach(p => {
      p.draw();
    });
  }

  // macro-viewer

  toggleMacroOrder(): void {
    this.macroConfig.order = !this.macroConfig.order;
    this._subscribeToMacro();
  }

  toggleMacroFilter(): void {
    this.macroConfig.filter = !this.macroConfig.filter;
    this._subscribeToMacro();
  }

  showPlots(): void {
    this.selectedContent = this.contentTypes.PLOTS;
  }

  showViewers(): void {
    this.selectedContent = this.contentTypes.VIEWERS;
  }

  // local/global plots

  hideLocalGlobalPlots(): void {
    this.showLocalGlobalPlots = false;
  }

  selectPlot(plot: Group): void {
    this.showLocalGlobalPlots = true;
    this._plotsService.selectPlot(plot);
  }

  showGlobalPlot(): void {
    this.selectedPlot = this.plotTypes.GLOBAL;
    this._plotsService.getSelectedGlobal(plot => {
      this.selectedGlobal = plot;
    });
  }

  showLocalPlot(): void {
    this.selectedPlot = this.plotTypes.LOCAL;
    this.selectedLocal = this._plotsService.getSelectedLocal();
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
