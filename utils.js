
const bs58 = require('bs58')

module.exports = {
	convertAddressToByteString: (address) => {
	  const bytes = bs58.decode(address)
	  return bytes;
	},

	convertByteToAddressString: (bytes) => {
		const string = bs58.encode(bytes)
		return string;
	},

	convertVbkToAtomicUnits: (input) => {
	  return input*100000000
	}, 

	convertAtomicToVbkUnits: (input) => {
	  return input/100000000
	}
}



