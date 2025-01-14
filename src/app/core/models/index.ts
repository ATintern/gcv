import { AppConfig, Brand, Communication, DashboardView, Dashboard,
  Miscellaneous, Tour } from './app-config.model';
import { GET, POST, Request, Script, Server } from './server.model';

export const models: any[] = [
  AppConfig,
  Brand,
  Communication,
  DashboardView,
  Dashboard,
  Miscellaneous,
  Tour,
  GET,
  POST,
  Request,
  Script,
  Server,
];

export * from './app-config.model';
export * from './server.model';
