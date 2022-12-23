const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

//  Route to fetch all notes. Using GET request "api/notes/fetchallnotes". login required

router.get('/fetchallnotes', fetchUser, async (req, res) => {
	try {
		const notes = await Notes.find({ user: req.user.id });
		res.json({ notes });
	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
});

//  Route to add notes. Using POST request "api/notes/addnote". login required

router.post(
	'/addnote',
	fetchUser,
	[
		body('title', 'Please enter a valid title').isLength({ min: 3 }),
		body(
			'description',
			'Description must contain more than 5 characters'
		).isLength({
			min: 5
		})
	],
	async (req, res) => {
		try {
			const { title, description, tag } = req.body;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const note = new Notes({
				title,
				description,
				tag,
				user: req.user.id
			});
			const savedNote = await note.save();
			res.json(savedNote);
		} catch (error) {
			res.status(500).send('Internal Server Error');
		}
	}
);

//  Route to updates note. Using PUT request "api/notes/updatenote". login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
	const { title, description, tag } = req.body;
	try {
		// Create new note
		const newNotes = {};
		if (title) {
			newNotes.title = title;
		}
		if (description) {
			newNotes.description = description;
		}
		if (tag) {
			newNotes.tag = tag;
		}

		// Find the id of the note to be updated and validate the user
		let notes = await Notes.findById(req.params.id);
		if (!notes) {
			return res.status(404).send('Note Not Found');
		}
		if (notes.user.toString() !== req.user.id) {
			return res.status(401).send('Unauthorized access');
		}

		// Now we will update the note

		notes = await Notes.findByIdAndUpdate(
			req.params.id,
			{ $set: newNotes },
			{ new: true }
		);
		res.json({ notes });
	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
});

//  Route to delete note. Using DELETE request "api/notes/delete". login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
	const { title, description, tag } = req.body;
	try {
		// Find the id of the note to be updated and validate the user
		let notes = await Notes.findById(req.params.id);
		if (!notes) {
			return res.status(404).send('Note Not Found');
		}
		if (notes.user.toString() !== req.user.id) {
			return res.status(401).send('Unauthorized access');
		}

		// Now we will update the note
		notes = await Notes.findByIdAndDelete(req.params.id);
		res.json('You deleted the note successfully');
	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
