// Angular
import { Component } from '@angular/core';
import { Router }    from '@angular/router';

// App
import { AppConfig } from '../../app.config';

@Component({
  moduleId: module.id,
  selector: 'app-gene-search',
  template: `
    <form (ngSubmit)="submit()" #gneSearchForm="ngForm">
      <div class="input-group">
        <input type="text" class="form-control" id="gene-search"
          [(ngModel)]="model.gene" name="gene"
          #geneSearch="ngModel"
          placeholder="e.g. phavu.Phvul.002G100400" >
        <span class="input-group-btn">
          <select class="select form-control" [(ngModel)]="model.source" name="source">
            <option *ngFor="let s of servers" [ngValue]="s">{{s.name}}</option>
          </select>
        </span>
        <span class="input-group-btn">
          <button class="btn btn-default" type="submit">Search</button>
        </span>
      </div>
    </form>
  `,
  styles: [`
    .select {
      width: auto;
      display: inline-block;
    }
    form button { margin-right: 0; }
  `]
})

export class GeneSearchComponent {

  public servers: Array<any> = AppConfig.SERVERS;
  public model: any = {source: this.servers[0], gene: ''};

  constructor(private _router: Router) { }

  submit(): void {
    let url = '/search/' + this.model.source.id + '/' + this.model.gene;
    this._router.navigateByUrl(url);
  }
}
