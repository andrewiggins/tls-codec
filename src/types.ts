// Supported TS features
// - arrays & typed arrays (MLS fixed & variable-length vectors, but must use our types)
// - discriminated unions
//  	- constant numerical values
// 		- objects with a "kind" field of a number TLS number type
// - interfaces (TLS Structs)
// - optional fields (MLS optional fields)
//
// Maybe later
// - tuples (TLS fixed-length vectors)

/** 8 bit (1 byte) unsigned integer */
export type u8 = number;
/** 16 bit (2 bytes) unsigned integer number */
export type u16 = number;
/** 24 bit (3 bytes) unsigned integer */
export type u24 = number;
/** 32-bit (4 bytes) unsigned integer */
export type u32 = number;
/** 64-bit (8 bytes) unsigned integer */
export type u64 = number;

/** A variable-length vector */
export type Vec<T> = T[];
/** A variable-length vector of bytes */
export type VLBytes = Uint8Array;

/** A vector whose length is specified by an 8 bit number */
export type TlsVecU8<T> = T[];
/** A vector whose length is specified by a 16 bit number */
export type TlsVecU16<T> = T[];
/** A vector whose length is specified by a 24 bit number */
export type TlsVecU24<T> = T[];
/** A vector whose length is specified by a 32 bit number */
export type TlsVecU32<T> = T[];
/** A vector whose length is specified by a 64 bit number */
export type TlsVecU64<T> = T[];

/** An array of bytes whose length is specified by an 8 bit number */
export type TlsByteVecU8 = Uint8Array;
/** An array of bytes whose length is specified by a 16 bit number */
export type TlsByteVecU16 = Uint8Array;
/** An array of bytes whose length is specified by a 24 bit number */
export type TlsByteVecU24 = Uint8Array;
/** An array of bytes whose length is specified by a 32 bit number */
export type TlsByteVecU32 = Uint8Array;
/** An array of bytes whose length is specified by a 64 bit number */
export type TlsByteVecU64 = Uint8Array;
