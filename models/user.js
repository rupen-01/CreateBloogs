const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/miniproject", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilepic: {
    type: String,
    default: "default.png"
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
