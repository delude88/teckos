// @ts-ignore
// eslint-disable-next-line import/extensions
import * as uWs from '../../ext/uWebSockets/dist/uws.js';
import {AppOptions, TemplatedApp} from "./types";

export const App = (options?: AppOptions): TemplatedApp => uWs(options) as TemplatedApp;
