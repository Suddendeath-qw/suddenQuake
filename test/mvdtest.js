const fs = require('fs');

const CHARSET = {
      0: 46, // .
      1: 35, // #
      2: 35,
      3: 35,
      4: 35,
      5: 46,
      6: 35,
      7: 35,
      8: 35,
      9: 35,
    //10: 32,
      11: 35,
      12: 32, // SPACE
      13: 62, // >
      14: 46,
      15: 46,
      16: 91, // [
      17: 93, // ]
      18: 48, // 0
      19: 49, // 1
      20: 50, // 2
      21: 51, // 3
      22: 52, // 4
      23: 53, // 5
      24: 54, // 6
      25: 55, // 7
      26: 56, // 8
      27: 57, // 9
      28: 46,
      29: 32,
      30: 32,
      31: 32,
      127: 32,
      128: 40, // (
      129: 61, // =
      130: 41, // )
      131: 35,
      132: 35,
      133: 46,
      134: 35,
      135: 35,
      136: 35,
      137: 35,
    //138: 32,
      139: 35,
      140: 32,
      141: 62,
      142: 46,
      143: 46,
    };

var quake_chars = function (data) {
  for(i = 0; i < data.length; i++) {
    // Nothing wrong with the normal ASCII characters
    if (data[i] > 31 && data[i] < 127) {
      continue;
    }

    // Replace secondary color (red) characters with their normal counterpart.
    // 144 - 159 = same as 16 - 31
    // 160 - 175 = SPACE - /
    // 176 - 185 =  1 - 9
    // 186 - 192 = : - @
    // 193 - 218 = A - Z
    // 219 - 224 = [ - `
    // 225 - 250 = a - z
    // 251 - 254 = | - ~ 
    else if (data[i] > 143 && data[i] < 255) {
      data[i] = data[i] - 128;
    }

    // Match the character towards the hash map
    if (CHARSET.hasOwnProperty(data[i])) {
      data[i] = CHARSET[data[i]];
    }
  }

  return data;
};



try {
  const data = fs.readFileSync('test.mvd')

  console.log(data[3])

  for (i = 0; i < data.length; i++) {
      //if (data[i] == 161) data[i] = 98
      if (data[i] == 195) data[i] = 98
      //if (data[i] == 174) data[i] = 98
  }

  const str = data.toString()

  //console.log(str)



  //console.log(data.toString().replaceAll("C3", "s").replaceAll("C'", "g").replaceAll("C,", "l", "C2", "r"))
} catch (err) {
  console.error(err)
}
