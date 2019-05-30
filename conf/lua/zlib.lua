local _M = {
}

local mt = { 
	__index = _M 
}

function _M.new(self)
	local ffi = require("ffi")
	if not ffi then
		return nil, "no ffi"
	end

	ffi.cdef [[
		unsigned long compressBound(unsigned long sourceLen);

		int compress2(
			uint8_t *dest,
			unsigned long *destLen,
			const uint8_t *source, 
			unsigned long sourceLen, 
			int level);

		int uncompress(
			uint8_t *dest, 
			unsigned long *destLen,
			const uint8_t *source, 
			unsigned long sourceLen);
	]]

	local zlib = ffi.load(ffi.os == "Windows" and "zlib" or "z")
	if not zlib then
		return nil, "no zlib"
	end

	return setmetatable({
		ffi = ffi,
		zlib = zlib
	}, mt)
end

function _M.zip(self, txt)
	local ffi, zlib = self.ffi, self.zlib

	local n = zlib.compressBound(#txt)
	local buf = ffi.new("uint8_t[?]", n)
	local buflen = ffi.new("unsigned long[1]", n)
	local res = zlib.compress2(buf, buflen, txt, #txt, 9)

	assert(res == 0)
	return ffi.string(buf, buflen[0])
end

function _M.unzip(self, comp, n)
	local ffi, zlib = self.ffi, self.zlib

	local buf = ffi.new("uint8_t[?]", n)
	local buflen = ffi.new("unsigned long[1]", n)
	local res = zlib.uncompress(buf, buflen, comp, #comp)

	assert(res == 0)
	return ffi.string(buf, buflen[0])
end

return _M