"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./AmbulancesPage.css"

function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAmbulance, setSelectedAmbulance] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [ambulanceToDelete, setAmbulanceToDelete] = useState(null)
  const [ambulanceToUpdatePosition, setAmbulanceToUpdatePosition] = useState(null)
  const [ambulanceToEdit, setAmbulanceToEdit] = useState(null)
  const [positionUpdate, setPositionUpdate] = useState({ latitude: "", longitude: "" })
  const [isUpdatingPosition, setIsUpdatingPosition] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // Formulaire pour ajouter/modifier une ambulance
  const [ambulanceForm, setAmbulanceForm] = useState({
    nom_vehicule: "",
    type: "",
    disponible: true,
    latitude: "",
    longitude: "",
    base_latitude: "",
    base_longitude: "",
  })

  const navigate = useNavigate()

  // Fonction pour ajouter le header Authorization
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    }
  }

  // Fonction pour afficher les notifications
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setAmbulanceForm({
      nom_vehicule: "",
      type: "",
      disponible: true,
      latitude: "",
      longitude: "",
      base_latitude: "",
      base_longitude: "",
    })
  }

  // Vérifier l'authentification et le rôle admin
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login")
      return
    }

    fetchAmbulances()
  }, [navigate])

  // Récupérer la liste des ambulances
  const fetchAmbulances = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/ambulances/", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setAmbulances(data)
      } else {
        showNotification("Erreur lors de la récupération des ambulances", "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible de récupérer les données", "error")
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les détails d'une ambulance
  const fetchAmbulanceDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/ambulances/${id}/`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedAmbulance(data)
        setShowDetailsModal(true)
      } else {
        showNotification("Erreur lors de la récupération des détails", "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible de récupérer les détails", "error")
    }
  }

  // Ajouter une nouvelle ambulance
  const addAmbulance = async () => {
    if (!ambulanceForm.nom_vehicule || !ambulanceForm.type || !ambulanceForm.latitude || !ambulanceForm.longitude) {
      showNotification("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/api/ambulances/", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...ambulanceForm,
          latitude: Number.parseFloat(ambulanceForm.latitude),
          longitude: Number.parseFloat(ambulanceForm.longitude),
          base_latitude: Number.parseFloat(ambulanceForm.base_latitude || ambulanceForm.latitude),
          base_longitude: Number.parseFloat(ambulanceForm.base_longitude || ambulanceForm.longitude),
        }),
      })

      if (response.ok) {
        await fetchAmbulances()
        resetForm()
        setShowAddModal(false)
        showNotification("Ambulance ajoutée avec succès")
      } else {
        const errorData = await response.json()
        showNotification("Erreur lors de l'ajout : " + (errorData.detail || "Erreur inconnue"), "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible d'ajouter l'ambulance", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Modifier une ambulance
  const editAmbulance = async () => {
    if (!ambulanceForm.nom_vehicule || !ambulanceForm.type || !ambulanceForm.latitude || !ambulanceForm.longitude) {
      showNotification("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/ambulances/${ambulanceToEdit.id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...ambulanceForm,
          latitude: Number.parseFloat(ambulanceForm.latitude),
          longitude: Number.parseFloat(ambulanceForm.longitude),
          base_latitude: Number.parseFloat(ambulanceForm.base_latitude || ambulanceForm.latitude),
          base_longitude: Number.parseFloat(ambulanceForm.base_longitude || ambulanceForm.longitude),
        }),
      })

      if (response.ok) {
        await fetchAmbulances()
        resetForm()
        setShowEditModal(false)
        setAmbulanceToEdit(null)
        showNotification("Ambulance modifiée avec succès")
      } else {
        const errorData = await response.json()
        showNotification("Erreur lors de la modification : " + (errorData.detail || "Erreur inconnue"), "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible de modifier l'ambulance", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Supprimer une ambulance
  const deleteAmbulance = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/ambulances/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setAmbulances(ambulances.filter((amb) => amb.id !== id))
        showNotification("Ambulance supprimée avec succès")
        setShowDeleteModal(false)
        setAmbulanceToDelete(null)
      } else {
        showNotification("Erreur lors de la suppression", "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible de supprimer l'ambulance", "error")
    }
  }

  // Mettre à jour la position GPS
  const updatePosition = async () => {
    if (!positionUpdate.latitude || !positionUpdate.longitude) {
      showNotification("Veuillez remplir tous les champs", "error")
      return
    }

    setIsUpdatingPosition(true)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ambulances/${ambulanceToUpdatePosition.id}/update_position/`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            latitude: Number.parseFloat(positionUpdate.latitude),
            longitude: Number.parseFloat(positionUpdate.longitude),
          }),
        },
      )

      if (response.ok) {
        await fetchAmbulances()
        setPositionUpdate({ latitude: "", longitude: "" })
        setShowPositionModal(false)
        setAmbulanceToUpdatePosition(null)
        showNotification("Position mise à jour avec succès")
      } else {
        showNotification("Erreur lors de la mise à jour de la position", "error")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      showNotification("Erreur réseau : Impossible de mettre à jour la position", "error")
    } finally {
      setIsUpdatingPosition(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("fr-FR")
  }

  const openPositionModal = (ambulance) => {
    setAmbulanceToUpdatePosition(ambulance)
    setPositionUpdate({
      latitude: ambulance.latitude.toString(),
      longitude: ambulance.longitude.toString(),
    })
    setShowPositionModal(true)
  }

  const openDeleteModal = (ambulance) => {
    setAmbulanceToDelete(ambulance)
    setShowDeleteModal(true)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (ambulance) => {
    setAmbulanceToEdit(ambulance)
    setAmbulanceForm({
      nom_vehicule: ambulance.nom_vehicule,
      type: ambulance.type,
      disponible: ambulance.disponible,
      latitude: ambulance.latitude.toString(),
      longitude: ambulance.longitude.toString(),
      base_latitude: ambulance.base_latitude.toString(),
      base_longitude: ambulance.base_longitude.toString(),
    })
    setShowEditModal(true)
  }

  const handleFormChange = (field, value) => {
    setAmbulanceForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Chargement des ambulances...</span>
      </div>
    )
  }

  return (
    <div className="ambulances-container">
      {/* Notification */}
      {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <span className="header-icon">🚑</span>
            <h1>Gestion des Ambulances</h1>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Ajouter une ambulance
          </button>
        </div>
      </div>

      {/* Content */}
      {ambulances.length === 0 ? (
        <div className="empty-state">
          <p>Aucune ambulance trouvée</p>
        </div>
      ) : (
        <div className="ambulances-grid">
          {ambulances.map((ambulance) => (
            <div key={ambulance.id} className="ambulance-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="vehicle-icon">🚑</span>
                  <span>{ambulance.nom_vehicule}</span>
                </div>
                <span className={`status-badge ${ambulance.disponible ? "available" : "busy"}`}>
                  {ambulance.disponible ? "Disponible" : "Occupée"}
                </span>
              </div>

              <div className="card-content">
                <div className="ambulance-info">
                  <p>
                    <strong>Type:</strong> {ambulance.type}
                  </p>
                  <div className="position-info">
                    <span className="location-icon">📍</span>
                    <span>
                      Position: {ambulance.latitude.toFixed(4)}, {ambulance.longitude.toFixed(4)}
                    </span>
                  </div>
                  <p className="last-update">Dernière MAJ: {formatDate(ambulance.derniere_mise_a_jour_position)}</p>
                </div>

                <div className="card-actions">
                  <button className="btn btn-outline" onClick={() => fetchAmbulanceDetails(ambulance.id)}>
                    👁️ Détails
                  </button>

                  <button className="btn btn-outline" onClick={() => openPositionModal(ambulance)}>
                    🧭 Position
                  </button>

                  <button className="btn btn-outline" onClick={() => openEditModal(ambulance)}>
                    ✏️ Modifier
                  </button>

                  <button className="btn btn-danger" onClick={() => openDeleteModal(ambulance)}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && selectedAmbulance && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'ambulance</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <label>Nom du véhicule</label>
                <p>{selectedAmbulance.nom_vehicule}</p>
              </div>
              <div className="detail-item">
                <label>Type</label>
                <p>{selectedAmbulance.type}</p>
              </div>
              <div className="detail-item">
                <label>Statut</label>
                <span className={`status-badge ${selectedAmbulance.disponible ? "available" : "busy"}`}>
                  {selectedAmbulance.disponible ? "Disponible" : "Occupée"}
                </span>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Position actuelle</label>
                  <p>Lat: {selectedAmbulance.latitude}</p>
                  <p>Lng: {selectedAmbulance.longitude}</p>
                </div>
                <div className="detail-item">
                  <label>Base</label>
                  <p>Lat: {selectedAmbulance.base_latitude}</p>
                  <p>Lng: {selectedAmbulance.base_longitude}</p>
                </div>
              </div>
              <div className="detail-item">
                <label>Dernière mise à jour</label>
                <p>{formatDate(selectedAmbulance.derniere_mise_a_jour_position)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Position */}
      {showPositionModal && ambulanceToUpdatePosition && (
        <div className="modal-overlay" onClick={() => setShowPositionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mettre à jour la position</h2>
              <button className="modal-close" onClick={() => setShowPositionModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={positionUpdate.latitude}
                  onChange={(e) => setPositionUpdate((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder="Ex: 48.8566"
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={positionUpdate.longitude}
                  onChange={(e) => setPositionUpdate((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder="Ex: 2.3522"
                />
              </div>
              <button onClick={updatePosition} disabled={isUpdatingPosition} className="btn btn-primary full-width">
                {isUpdatingPosition ? "⏳ Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter une nouvelle ambulance</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="add-nom">Nom du véhicule *</label>
                  <input
                    id="add-nom"
                    type="text"
                    value={ambulanceForm.nom_vehicule}
                    onChange={(e) => handleFormChange("nom_vehicule", e.target.value)}
                    placeholder="Ex: AMB-001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-type">Type *</label>
                  <select
                    id="add-type"
                    value={ambulanceForm.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="ASSU">A-Transport simple</option>
                    <option value="VSL">B-Soins ou surveillance</option>
                    <option value="SMUR">C-Urgence vitale/Réanimation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="add-disponible">Statut</label>
                  <select
                    id="add-disponible"
                    value={ambulanceForm.disponible}
                    onChange={(e) => handleFormChange("disponible", e.target.value === "true")}
                  >
                    <option value={true}>Disponible</option>
                    <option value={false}>Occupée</option>
                  </select>
                </div>
              </div>

              <h3 className="section-title">Position actuelle</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="add-lat">Latitude *</label>
                  <input
                    id="add-lat"
                    type="number"
                    step="any"
                    value={ambulanceForm.latitude}
                    onChange={(e) => handleFormChange("latitude", e.target.value)}
                    placeholder="Ex: 48.8566"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-lng">Longitude *</label>
                  <input
                    id="add-lng"
                    type="number"
                    step="any"
                    value={ambulanceForm.longitude}
                    onChange={(e) => handleFormChange("longitude", e.target.value)}
                    placeholder="Ex: 2.3522"
                  />
                </div>
              </div>

              <h3 className="section-title">Base (optionnel)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="add-base-lat">Latitude de base</label>
                  <input
                    id="add-base-lat"
                    type="number"
                    step="any"
                    value={ambulanceForm.base_latitude}
                    onChange={(e) => handleFormChange("base_latitude", e.target.value)}
                    placeholder="Ex: 48.8566"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-base-lng">Longitude de base</label>
                  <input
                    id="add-base-lng"
                    type="number"
                    step="any"
                    value={ambulanceForm.base_longitude}
                    onChange={(e) => handleFormChange("base_longitude", e.target.value)}
                    placeholder="Ex: 2.3522"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button onClick={addAmbulance} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? "⏳ Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && ambulanceToEdit && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'ambulance</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-nom">Nom du véhicule *</label>
                  <input
                    id="edit-nom"
                    type="text"
                    value={ambulanceForm.nom_vehicule}
                    onChange={(e) => handleFormChange("nom_vehicule", e.target.value)}
                    placeholder="Ex: AMB-001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-type">Type *</label>
                  <select
                    id="edit-type"
                    value={ambulanceForm.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="ASSU">A-Transport simple</option>
                    <option value="VSL">B-Soins ou surveillance</option>
                    <option value="SMUR">C-Urgence vitale/Réanimation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-disponible">Statut</label>
                  <select
                    id="edit-disponible"
                    value={ambulanceForm.disponible}
                    onChange={(e) => handleFormChange("disponible", e.target.value === "true")}
                  >
                    <option value={true}>Disponible</option>
                    <option value={false}>Occupée</option>
                  </select>
                </div>
              </div>

              <h3 className="section-title">Position actuelle</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-lat">Latitude *</label>
                  <input
                    id="edit-lat"
                    type="number"
                    step="any"
                    value={ambulanceForm.latitude}
                    onChange={(e) => handleFormChange("latitude", e.target.value)}
                    placeholder="Ex: 48.8566"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-lng">Longitude *</label>
                  <input
                    id="edit-lng"
                    type="number"
                    step="any"
                    value={ambulanceForm.longitude}
                    onChange={(e) => handleFormChange("longitude", e.target.value)}
                    placeholder="Ex: 2.3522"
                  />
                </div>
              </div>

              <h3 className="section-title">Base</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-base-lat">Latitude de base</label>
                  <input
                    id="edit-base-lat"
                    type="number"
                    step="any"
                    value={ambulanceForm.base_latitude}
                    onChange={(e) => handleFormChange("base_latitude", e.target.value)}
                    placeholder="Ex: 48.8566"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-base-lng">Longitude de base</label>
                  <input
                    id="edit-base-lng"
                    type="number"
                    step="any"
                    value={ambulanceForm.base_longitude}
                    onChange={(e) => handleFormChange("base_longitude", e.target.value)}
                    placeholder="Ex: 2.3522"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button onClick={editAmbulance} disabled={isSaving} className="btn btn-primary">
                  {isSaving ? "⏳ Modification..." : "Modifier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && ambulanceToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer l'ambulance "{ambulanceToDelete.nom_vehicule}" ? Cette action est
                irréversible.
              </p>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-danger" onClick={() => deleteAmbulance(ambulanceToDelete.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AmbulancesPage
