// Angular
import { Http, Response } from '@angular/http';
import { Injectable }     from '@angular/core';
import { Observable }     from 'rxjs/Observable';

// App
import { Gene }              from '../models/gene.model';
import { GET, POST, Server } from '../models/server.model';
import { SERVERS }           from '../constants/servers';

@Injectable()
export class DetailsService {
  private _servers = SERVERS;
  private _serverIDs = this._servers.map(s => s.id);

  constructor(private _http: Http) { }

  getGeneDetails(gene: Gene, callback: Function): void {
    let idx = this._serverIDs.indexOf(gene.source);
    if (idx != -1) {
      let s: Server = this._servers[idx];
      if (s.hasOwnProperty('geneLinks')) {
        let url = s.geneLinks.url + gene.name + '/json';
        let response: Observable<Response>;
        if (s.geneLinks.type === GET)
          response = this._http.get(url, {});
        else
          response = this._http.post(url, {});
        response.toPromise().then(res => {
          callback(res.json());
        });
      }
    }
    return undefined;
  }
}
