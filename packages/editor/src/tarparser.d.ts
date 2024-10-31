declare module 'tarparser' {
	/**
	 * @typedef FileDescription
	 * @property {string} name - The name of the file.
	 * @property {"file"|"directory"} type - The type of the file, either "file" or "directory".
	 * @property {number} size - The size of the file in bytes.
	 * @property {Uint8Array} data - The binary data of the file content.
	 * @property {string} text - A getter to decode and return the file content as a UTF-8 string.
	 * @property {FileAttrs} attrs - file attributes
	 */
	/**
	 * @typedef FileAttrs
	 * @property {string} mode - The file permissions in octal format.
	 * @property {number} uid - User ID of the file owner.
	 * @property {number} gid - Group ID of the file owner.
	 * @property {number} mtime - Last modification time in Unix time format.
	 * @property {string} user - The username of the file owner.
	 * @property {string} group - The group name of the file owner.
	 */
	/**
	 * Parses a tar file from binary data and returns an array of FileDescription objects.
	 * @param {ArrayBuffer|Uint8Array} data - The binary data of the tar file.
	 * @returns {Promise<FileDescription[]>} - An array of FileDescription objects representing the parsed files in the tar archive.
	 */
	export function parseTar(data: ArrayBuffer | Uint8Array): Promise<FileDescription[]>;
	export type FileDescription = {
		/**
		 * - The name of the file.
		 */
		name: string;
		/**
		 * - The type of the file, either "file" or "directory".
		 */
		type: 'file' | 'directory';
		/**
		 * - The size of the file in bytes.
		 */
		size: number;
		/**
		 * - The binary data of the file content.
		 */
		data: Uint8Array;
		/**
		 * - A getter to decode and return the file content as a UTF-8 string.
		 */
		text: string;
		/**
		 * - file attributes
		 */
		attrs: FileAttrs;
	};
	export type FileAttrs = {
		/**
		 * - The file permissions in octal format.
		 */
		mode: string;
		/**
		 * - User ID of the file owner.
		 */
		uid: number;
		/**
		 * - Group ID of the file owner.
		 */
		gid: number;
		/**
		 * - Last modification time in Unix time format.
		 */
		mtime: number;
		/**
		 * - The username of the file owner.
		 */
		user: string;
		/**
		 * - The group name of the file owner.
		 */
		group: string;
	};
}
