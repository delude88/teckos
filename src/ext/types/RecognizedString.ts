/** Recognized string types, things C++ can read and understand as strings.
 * "String" does not have to mean "text", it can also be "binary".
 *
 * Ironically, JavaScript strings are the least performant of all options,
 * to pass or receive to/from C++.
 * This because we expect UTF-8, which is packed in 8-byte chars.
 * JavaScript strings are UTF-16 internally meaning extra copies and reinterpretation are required.
 *
 * That's why all events pass data by ArrayBuffer and not JavaScript
 * strings, as they allow zero-copy data passing.
 *
 * You can always do Buffer.from(arrayBuffer).toString(),
 * but keeping things binary and as ArrayBuffer is preferred.
 */
export type RecognizedString =
  string
  | ArrayBuffer
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;
