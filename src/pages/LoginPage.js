"use client"

import { useState } from "react"
import "./LoginPage.css"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login-admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)
        window.location.href = "/dashboard"
      } else {
        setError("Erreur lors de la connexion")
      }
    } catch (err) {
      console.error(err)
      setError(" Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🛡️</div>
          <h1 className="login-title">Connexion de l'administrateur</h1>
          <p className="login-description">Entrez vos informations pour accéder au tableau de bord</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
             Email
            </label>
            <div className="input-container">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="Veuillez saisir votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
              Connexion en cours, veuillez patienter...
              </>
            ) : (
            "Connexion"
            )}
          </button>
        </form>

       <div className="login-footer">Panneau de contrôle administratif - Protégé et sécurisé</div>

      </div>
    </div>
  )
}

export default LoginPage