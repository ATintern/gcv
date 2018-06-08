export const GET = "GET";
export const POST = "POST";

export class Request {
  type: "GET" | "POST";  // GET or POST
  url: string;
}

export class Server {
  id: string;  // unique & url friendly
  name: string;
  microMulti: Request;
  microSearch: Request;
  microQuery: Request;
  macro: Request;
  geneLinks: Request;
  familyTreeLink: Request;
  plotGlobal: Request;
  nearestGene: Request;
  chromosome: Request;
}
