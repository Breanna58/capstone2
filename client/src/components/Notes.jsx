import { useEffect, useState } from 'react';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // fetch notes from backend
  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error(err));
  }, []);

  // add a new note
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote }),
      });

      const createdNote = await res.json();
      setNotes([createdNote, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div>
      <h1>My notes</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write new note"
        />
        <button type="submit">Add Note</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>{note.text || note.txt}</li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;

