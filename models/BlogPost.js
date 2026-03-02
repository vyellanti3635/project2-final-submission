const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
        required: true,
        trim: true
  },
  content: {
        type: String,
		required: true
	},
  author: {
    type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
        required: true
  },
  image: {
  type: String,
  default: null
	
},
 excerpt: {
        type: String
    },
  viewCount: {
    type: Number,
    default: 0
    },
	createdAt: {
		type: Date,
    default: Date.now
    },
    updatedAt: {
    type: Date,
    default: Date.now
    }
});

blogPostSchema.pre('save', function() {
	if (this.isModified('content')) {
        this.excerpt = this.content.substring(0, 200);
    }
  
  this.updatedAt = Date.now();
});

blogPostSchema.methods.incrementViewCount = async function() {
	this.viewCount += 1;
	return await this.save();
};

module.exports = mongoose.model("BlogPost", blogPostSchema);
