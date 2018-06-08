import { Server } from "./server.model";

export class Brand {
  url?: string;
  img?: string;
  name?: string;
  slogan?: string;
}

export class DashboardView {
  img?: string;  // URL to example screenshot
  caption?: string;
}

export class Dashboard {
  search?: DashboardView;
  multi?: DashboardView;
  examples?: string[];  // each string should contain HTML with a description and link to an example
}

export class Miscellaneous {
  geneSearchPlaceholder?: string;
}

export class Config {
  brand?: Brand;
  dashboard?: Dashboard;
  miscellaneous?: Miscellaneous;
  servers: Server[];
}
