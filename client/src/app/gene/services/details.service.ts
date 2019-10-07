// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// app
import { Gene } from '@gcv/gene/models';
import { HttpService } from '@gcv/core/services/http.service';

@Injectable()
export class DetailsService extends HttpService {

  constructor(private _http: HttpClient) {
    super(_http);
  }

  getGeneDetails(gene: Gene, success: (e) => void): void {
    this._makeRequest<any>(
      gene.source,
      'geneLinks',
      {},
      (url: string) => url + gene.name + '/json',
    )
      .subscribe(
        success,
        (error) => {
          console.log(error);
        }
      );
  }
}
