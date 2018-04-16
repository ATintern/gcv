// Angular
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

// App
import { Group } from "../../models/group.model";

@Component({
  moduleId: module.id.toString(),
  selector: "track-detail",
  styles: [ "" ],
  template: `
    <h4>{{track.genus[0]}}.{{track.species}} - {{track.chromosome_name}}</h4>
    <p><a [routerLink]="['/search', track.source, focus]" queryParamsHandling="merge">Search for similar contexts</a></p>
    <p ><a href="https://intermine.legumefederation.org/legumemine/bag.do?subtab=upload&type=Gene&text={{geneListFormatted}}">Create gene list in LegumeMine</a></p>
    <p>Genes:</p>
    <ul>
      <li *ngFor="let gene of track.genes">
        {{gene.name}}: {{gene.fmin}} - {{gene.fmax}}
        <ul *ngIf="gene.family != ''">
          <li>
            Family: <a href="/chado_gene_phylotree_v2?family={{gene.family}}&gene_name={{gene.name}}">{{gene.family}}</a>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
export class TrackDetailComponent implements OnChanges {
  @Input() track: Group;

  focus: string;
  geneListFormatted: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.track !== undefined) {
      const idx = Math.floor(this.track.genes.length / 2);
      this.focus = this.track.genes[idx].name;
      this.geneListFormatted = this.track.genes.map(x => x.name).join('%0A');
    }
  }
}
