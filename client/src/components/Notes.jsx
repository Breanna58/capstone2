import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const token = localStorage.getItem('token');

  // fetch notes from backend (with token)
  useEffect(() => {
    if (!token) return;
  
    fetch('/api/notes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
  
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('Invalid JSON response from server');
        }
  
        setNotes(data);
      })
      .catch(err => {
        console.error(err);
        alert('Please log in to view notes');
      });
  }, [token]);

  // add a new note (with token)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), 
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      const { token } = data;
      localStorage.setItem('token', token); 
      navigate('/notes'); 
    } catch (err) {
      alert(err.message);
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
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
