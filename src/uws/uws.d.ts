/*
 * Authored by Alex Hultman, 2018-2021.
 * Intellectual property of third-party.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    AppOptions,
    CompressOptions,
    RecognizedString,
    TemplatedApp,
    us_listen_socket,
    us_socket,
} from './types'

declare module '*uws_*.node' {
    /** Constructs a non-SSL app. An app is your starting point where you attach behavior to URL routes.
     * This is also where you listen and run your app, set any SSL options (in case of SSLApp) and the like.
     */
    export function App(options?: AppOptions): TemplatedApp

    /** Constructs an SSL app. See App. */
    export function SSLApp(options: AppOptions): TemplatedApp

    /** Closes a uSockets listen socket. */
    export function us_listen_socket_close(listenSocket: us_listen_socket): void

    /** Gets local port of socket (or listenSocket) or -1. */
    export function us_socket_local_port(socket: us_socket): number

    export interface MultipartField {
        data: ArrayBuffer
        name: string
        type?: string
        filename?: string
    }

    /** Takes a POSTed body and contentType, and returns an array of parts if the request is a multipart request */
    export function getParts(
        body: RecognizedString,
        contentType: RecognizedString
    ): MultipartField[] | undefined

    /** No compression (always a good idea if you operate using an efficient binary protocol) */
    export let DISABLED: CompressOptions
    /** Zero memory overhead compression (recommended for pub/sub where same message is sent to many receivers) */
    export let SHARED_COMPRESSOR: CompressOptions
    /** Sliding dedicated compress window, requires 3KB of memory per socket */
    export let DEDICATED_COMPRESSOR_3KB: CompressOptions
    /** Sliding dedicated compress window, requires 4KB of memory per socket */
    export let DEDICATED_COMPRESSOR_4KB: CompressOptions
    /** Sliding dedicated compress window, requires 8KB of memory per socket */
    export let DEDICATED_COMPRESSOR_8KB: CompressOptions
    /** Sliding dedicated compress window, requires 16KB of memory per socket */
    export let DEDICATED_COMPRESSOR_16KB: CompressOptions
    /** Sliding dedicated compress window, requires 32KB of memory per socket */
    export let DEDICATED_COMPRESSOR_32KB: CompressOptions
    /** Sliding dedicated compress window, requires 64KB of memory per socket */
    export let DEDICATED_COMPRESSOR_64KB: CompressOptions
    /** Sliding dedicated compress window, requires 128KB of memory per socket */
    export let DEDICATED_COMPRESSOR_128KB: CompressOptions
    /** Sliding dedicated compress window, requires 256KB of memory per socket */
    export let DEDICATED_COMPRESSOR_256KB: CompressOptions
}
