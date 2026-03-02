const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
        type: String,
        required: true,
    unique: true,
    trim: true
    },
	email: {
		type: String,
    required: true,
    unique: true,
         lowercase: true
    },
  password: {
    type: String,
        required: true
	},
	isAdmin: {
  type: Boolean,
  default: false
    
},
  createdAt: {
    type: Date,
    default: Date.now
    }
});

userSchema.pre('save', async function() {

    // if (!req.body.email || !req.body.password) {
    //   return res.status(400).json({ error: 'Missing fields' });
    // }
    // if (req.body.password.length < 6) {
    //   return res.status(400).json({ error: 'Password too short' });
    // }
    if (!this.isModified('password')) {
        return;
  }
  
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, rounds);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
