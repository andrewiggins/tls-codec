import type { Vec } from "./types.d.ts";

type Deserializer<T> = (reader: Reader) => T;

export class Reader {
	#buffer: Uint8Array;
	#offset: number;

	constructor(buffer: Uint8Array, initialOffset = 0) {
		this.#buffer = buffer;
		this.#offset = initialOffset;

		if (this.#buffer.length < this.#offset) {
			throw new Error("Buffer too small to read from.");
		}
	}

	#readSubarray(length: number): Uint8Array {
		const sub = this.#buffer.subarray(this.#offset, this.#offset + length);
		this.#offset += length;
		return sub;
	}

	/** Reads a single byte from the buffer. */
	readUint8(): number {
		if (this.#buffer.length - this.#offset < 1) {
			throw new Error("Buffer too small to read Uint8.");
		}

		return this.#buffer[this.#offset++];
	}

	/** Reads a 16-bit unsigned integer from the buffer. */
	readUint16(): number {
		const buf = this.#buffer;
		const i = this.#offset;

		const u16 = (buf[i] << 8) | buf[i + 1];

		this.#offset += 2;
		return u16;
	}

	/** Reads a 32-bit unsigned integer from the buffer. */
	readUint32(): number {
		const buf = this.#buffer;
		const i = this.#offset;

		const u32 =
			(buf[i] << 24) | (buf[i + 1] << 16) | (buf[i + 2] << 8) | buf[i + 3];

		this.#offset += 4;
		return u32;
	}

	readTlsVecU32<T>(parseItem: Deserializer<T>): T[] {
		const len = this.readUint32();
		if (this.#buffer.length - 4 < len) {
			throw new Error(`Buffer to small to read TlsVec32 of length ${len}.`);
		}

		return Array.from({ length: len }, () => parseItem(this));
	}

	readTlsByteVecU8(): Uint8Array {
		const len = this.readUint8();
		if (this.#buffer.length - 1 < len) {
			throw new Error(`Invalid length reading TlsByteVec8: ${len}`);
		}

		return this.#readSubarray(len);
	}

	#readVariableLengthLength(): number {
		const firstByte = this.readUint8();

		/**
		 * The number of bytes to read to get the vector's length is determined by
		 * the first two bits of the first byte. So len_length_key is the first two
		 * bits of the firstByte (i.e. the number 0, 1, 2, 3).
		 *
		 * This is called `prefix` in the spec pseudocode.
		 */
		const len_length_prefix = firstByte >> 6;
		if (len_length_prefix === 3) {
			throw new Error("invalid variable length integer prefix");
		}

		/**
		 * Shift 1 `len_length_key` number of times to get the number of bytes the
		 * length is encoded in. Spelled out:
		 * - 1 << 0 = 1 byte
		 * - 1 << 1 = 2 bytes
		 * - 1 << 2 = 4 bytes
		 * - 1 << 3 = invalid per spec
		 */
		let len_length = 1 << len_length_prefix;

		// The remaining bits of the first byte are the first bits of the actual
		// length of the vector.
		let length = firstByte & 0x3f;
		while (len_length-- > 1) {
			length = (length << 8) | this.readUint8();
		}

		// Check if the value would fit in half the provided length. Spec requires
		// that this throws an error.
		if (len_length_prefix >= 1 && length < 1 << (8 * (len_length / 2) - 2)) {
			throw new Error("minimum encoding was not used");
		}

		return length;
	}

	readVLBytes(): Uint8Array {
		const length = this.#readVariableLengthLength();
		return this.#readSubarray(length);
	}

	readVec<T>(parseItem: Deserializer<T>): Vec<T> {
		const length = this.#readVariableLengthLength();

		const vector: Vec<T> = [];

		let read = 0;
		let prevOffset = this.#offset;
		while (read < length) {
			vector.push(parseItem(this));
			read += this.#offset - prevOffset;
			prevOffset = this.#offset;
		}

		return vector;
	}

	readObjectEntries<K, V>(
		length: number,
		parseKey: Deserializer<K>,
		parseValue: Deserializer<V>,
	): [K, V][] {
		return Array.from({ length }, () => [parseKey(this), parseValue(this)]);
	}
}
