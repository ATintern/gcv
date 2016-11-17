export class Request {
  type: string;  // GET or POST
  url: string;
}

export class Server {
  id: string;  // unique & url friendly
  name: string;
  microBasic: Request;
  microSearch: Request;
  microQuery: Request;
  macro: Request;
  geneLinks: Request;
  plotGlobal: Request;
}
