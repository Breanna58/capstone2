import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {

        e.preventDefault()
        try {
            const res = await fetch('/api/auth/login', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json '}, 
            body: JSON.stringify({ email, password }), 
         })

         const data = await res.json(); 
            if (res.ok) {
                localStorage.setItem('token', data.token)
                navigate("/notes")
            } else {
                alert(data.message || 'Login Failed')

            }
        }  catch (err) {
            console.log(err)

        }
    }

    return (


        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /> 
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit"> Login</button>

        </form>
    )

}

