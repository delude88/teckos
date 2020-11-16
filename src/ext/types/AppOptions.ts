import { RecognizedString } from '../types';

/** Options used when constructing an app. Especially for SSLApp.
 * These are options passed directly to uSockets, C layer.
 */
export interface AppOptions {
  key_file_name?: RecognizedString;
  cert_file_name?: RecognizedString;
  passphrase?: RecognizedString;
  dh_params_file_name?: RecognizedString;
  /** This translates to SSL_MODE_RELEASE_BUFFERS */
  ssl_prefer_low_memory_usage?: boolean;
}
