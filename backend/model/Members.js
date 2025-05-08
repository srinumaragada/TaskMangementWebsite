const mongoose = require('mongoose');
const { Schema } = mongoose;

const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

const Member = mongoose.model("Member",MemberSchema)
module.exports = Member
