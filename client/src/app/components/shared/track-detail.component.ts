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
    <p><a href="#/search/{{track.source}}/{{focus}}">Search for similar contexts</a></p>
    <p>Genes:</p>
    <ul>
      <li *ngFor="let gene of track.genes">
        {{gene.name}}: {{gene.fmin}} - {{gene.fmax}}
        <ul *ngIf="gene.family != ''">
          <li>
            Family: <a href="http://legumeinfo.org/chado_gene_phylotree_v2?family={{gene.family}}&gene_name={{gene.name}}">{{gene.family}}</a>
          </li>
        </ul>
      </li>
    </ul>
  `,
})
export class TrackDetailComponent implements OnChanges {
  @Input() track: Group;

  focus: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.track !== undefined) {
      const idx = Math.floor(this.track.genes.length / 2);
      this.focus = this.track.genes[idx].name;
    }
  }
}
