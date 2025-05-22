import { useEffect, useState } from 'react';
import axios from 'axios';  // import axios here

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const token = localStorage.getItem('token');

  // Fetch notes
  useEffect(() => {
    if (!token) return;

    fetch('/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('Invalid JSON response from server');
        }
        setNotes(data);
      })
      .catch((err) => {
        console.error(err);
        alert('Please log in to view notes');
      });
  }, [token]);

  // Add note
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newNote }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const savedNote = await res.json();
      setNotes([...notes, savedNote]);
      setNewNote('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete note
  const handleDelete = async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setNotes(notes.filter((note) => note.id !== noteId));
      } else {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        alert(data.message || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting the note.');
    }
  };

  // Edit note handlers omitted for brevity (keep yours as is)

  // **Add to Cart
const handleAddToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Failed to add to cart.');
      alert(`Added ${item.text || item.name} to cart`);
    } catch (error) {
      alert(error.message);
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
        <button type="submit">Add to cart</button>
      </form>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {editingNoteId === note.id ? (
              <>
                <input
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <button onClick={() => handleSave(note.id)}>Save</button>
                <button onClick={() => setEditingNoteId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {note.text}{' '}
                <button onClick={() => startEditing(note)}>Edit</button>
                <button onClick={() => handleDelete(note.id)}>Delete</button>
                {/* Add to Cart Button here */}
                <button onClick={() => handleAddToCart(note)}>Add to Cart</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
