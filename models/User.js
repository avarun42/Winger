var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  photo: String,
  id: String,

  provider: String,
  microsoft: String,
  // google: String,
  tokens: Array,
  name: { type: String, default: '' },

  profile: {
    gender: { type: String, default: '' },
    website: { type: String, default: '' }
  }
});

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

// userSchema.methods.gravatar = function(size) {
//   if (!size) size = 200;

//   if (!this.email) {
//     return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
//   }

//   var md5 = crypto.createHash('md5').update(this.email).digest('hex');
//   return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
// };

module.exports = mongoose.model('User', userSchema);
