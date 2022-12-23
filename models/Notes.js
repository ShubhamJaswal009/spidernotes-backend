const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'notes'
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	tag: {
		type: String,
		default: 'General'
	},
	date: {
		type: Number,
		date: Date.now
	}
});

const Notes = mongoose.model('notes', NotesSchema);
Notes.createIndexes();
module.exports = Notes;
