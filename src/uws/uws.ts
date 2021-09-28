// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="uws.d.ts"/>
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

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Will be compiled into one JS later, so refer always from lib/ or src/
// eslint-disable-next-line import/no-default-export
export default require('./../bin/uws_' +
    process.platform +
    '_' +
    process.arch +
    '_' +
    process.versions.modules +
    '.node')
