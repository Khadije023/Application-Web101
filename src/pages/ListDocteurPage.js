"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./ListDocteurPage.css"

const ListDocteurPage = () => {
  const navigate = useNavigate()
  const [docteurs, setDocteurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDocteur, setEditingDocteur] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [notification, setNotification] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [docteursPerPage] = useState(10) // 10 docteurs par page
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    phone: "",
    code_secret: "",
    specialite: "Généraliste",
  })

  // 🔒 Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    }
  }

  // 🔒 Vérification des autorisations admin
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login")
      return
    }

    fetchDocteurs()
  }, [navigate])

  // 📋 Récupérer la liste des docteurs
  const fetchDocteurs = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://127.0.0.1:8000/api/listdocteur/", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setDocteurs(data)
      } else {
        showNotification("Impossible de charger la liste des docteurs", "error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("Une erreur est survenue lors du chargement", "error")
    } finally {
      setLoading(false)
    }
  }

  // 📢 Afficher une notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // 🖨️ Fonction d'impression
  const handlePrint = () => {
    window.print()
  }

  // Calculer les docteurs pour la page courante
  const filteredDocteurs = docteurs.filter(
    (docteur) =>
      docteur.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docteur.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docteur.specialite?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastDocteur = currentPage * docteursPerPage
  const indexOfFirstDocteur = indexOfLastDocteur - docteursPerPage
  const currentDocteurs = filteredDocteurs.slice(indexOfFirstDocteur, indexOfLastDocteur)
  const totalPages = Math.ceil(filteredDocteurs.length / docteursPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // ➕ Ajouter ou modifier un docteur
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingDocteur ? `http://127.0.0.1:8000/api/docteur/${editingDocteur.id}/` : "http://127.0.0.1:8000/api/register-docteur/"
      const method = editingDocteur ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showNotification(editingDocteur ? "Docteur modifié avec succès" : "Docteur ajouté avec succès")
        setIsModalOpen(false)
        resetForm()
        fetchDocteurs()
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || "Une erreur est survenue", "error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("Une erreur est survenue", "error")
    }
  }

  // 🚫 Bloquer/Débloquer un docteur
  const handleBlockToggle = async (docteur) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/docteur/${docteur.id}/block/`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        showNotification(`Docteur ${docteur.is_blocked ? "débloqué" : "bloqué"} avec succès`)
        fetchDocteurs()
      } else {
        showNotification("Impossible de modifier le statut du docteur", "error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("Une erreur est survenue", "error")
    }
  }

  // 🗑️ Supprimer un docteur
  const handleDelete = async (docteurId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/docteur/${docteurId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        showNotification("Docteur supprimé avec succès")
        fetchDocteurs()
        setShowDeleteConfirm(null)
      } else {
        showNotification("Impossible de supprimer le docteur", "error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("Une erreur est survenue", "error")
    }
  }

  // ✏️ Préparer l'édition
  const handleEdit = (docteur) => {
    setEditingDocteur(docteur)
    setFormData({
      nom: docteur.nom || "",
      email: docteur.email || "",
      phone: docteur.phone || "",
      code_secret: docteur.code_secret || "",
      specialite: docteur.specialite || "Généraliste",
    })
    setIsModalOpen(true)
  }

  // 🔄 Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: "",
      email: "",
      phone: "",
      code_secret: "",
      specialite: "Généraliste",
    })
    setEditingDocteur(null)
  }

  return (
    <div className="docteur-page">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="notification-close">
            ×
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gestion des Docteurs</h1>
          <p>Gérez la liste des docteurs de votre plateforme</p>
        </div>
        <div className="header-buttons">
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨️ Imprimer
          </button>
          <button
            className="btn btn-primary"
            style={{ backgroundColor: "#fa4b4b", color: "white", border: "none" }}
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
          >
            <span className="btn-icon">+</span>
            Ajouter un Docteur
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Tableau des docteurs */}
      <div className="table-section">
        <div className="table-header">
          <h3 style={{ color: "white" }}>Liste des Docteurs ({filteredDocteurs.length})</h3>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="docteurs-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDocteurs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Aucun docteur trouvé
                    </td>
                  </tr>
                ) : (
                  currentDocteurs.map((docteur) => (
                    <tr key={docteur.id}>
                      <td className="font-medium">{docteur.nom}</td>
                      <td>{docteur.email}</td>
                      <td>{docteur.phone}</td>
                      <td>{docteur.specialite}</td>
                      <td>
                        <span className={`status-badge ${docteur.is_blocked ? "blocked" : "active"}`}>
                          {docteur.is_blocked ? "Bloqué" : "Actif"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => handleEdit(docteur)} title="Modifier">
                            ✏️
                          </button>
                          <button
                            className={`action-btn ${docteur.is_blocked ? "unblock" : "block"}`}
                            onClick={() => handleBlockToggle(docteur)}
                            title={docteur.is_blocked ? "Débloquer" : "Bloquer"}
                          >
                            {docteur.is_blocked ? "🛡️" : "🚫"}
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => setShowDeleteConfirm(docteur)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Affichage de {indexOfFirstDocteur + 1} à {Math.min(indexOfLastDocteur, filteredDocteurs.length)} sur{" "}
            {filteredDocteurs.length} docteurs
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
              ← Précédent
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDocteur ? "Modifier le Docteur" : "Ajouter un Docteur"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nom">Nom complet *</label>
                <input
                  id="nom"
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Téléphone *</label>
                <input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="code_secret">Code secret *</label>
                <input
                  id="code_secret"
                  type="text"
                  value={formData.code_secret}
                  onChange={(e) => setFormData({ ...formData, code_secret: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialite">Spécialité *</label>
                <input
                  id="specialite"
                  type="text"
                  value={formData.specialite}
                  onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDocteur ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le docteur <strong>{showDeleteConfirm.nom}</strong> ?
              </p>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm.id)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListDocteurPage
