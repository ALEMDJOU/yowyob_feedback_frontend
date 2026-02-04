"use client";
import React, { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/components/I18nProvider';
import { userService } from '@/lib/services';
import { UserResponseDTO, UserType, UpdateProfileRequestDTO } from '@/lib/types/api';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/components/ToastProvider';

export default function EditProfilePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [formData, setFormData] = useState<UpdateProfileRequestDTO>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);

        // LOCATION PARSING HACK
        let description = data.description || '';
        let location = data.location || '';

        if (data.user_type === UserType.PERSON && !location) {
          const match = description.match(/(.*)\s\[Location:\s(.*)\]$/);
          if (match) {
            description = match[1];
            location = match[2];
          }
        }

        setFormData({
          user_firstname: data.user_firstname || '',
          user_lastname: data.user_lastname || '',
          email: data.email || '',
          contact: data.contact || '',
          domain: data.domain || '',
          description: description, // Clean description
          occupation: data.occupation || '',
          location: location, // Extracted location
          user_logo: data.user_logo || ''
        });
      } catch (err: any) {
        showToast('Erreur lors de la récupération du profil.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('yowyob_feedback')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('yowyob_feedback')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, user_logo: publicUrl }));
      showToast('Image téléchargée avec succès !', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du téléchargement de l\'image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: UpdateProfileRequestDTO = {};
      let hasChanges = false;

      const normalize = (val: string | null | undefined) => (val || '').trim();

      const hasChanged = (newVal: string | undefined, oldVal: string | undefined | null) => {
        return normalize(newVal) !== normalize(oldVal);
      };

      if (user) {
        if (hasChanged(formData.user_firstname, user.user_firstname)) { updateData.user_firstname = formData.user_firstname; hasChanges = true; }
        if (hasChanged(formData.user_lastname, user.user_lastname)) { updateData.user_lastname = formData.user_lastname; hasChanges = true; }
        if (hasChanged(formData.email, user.email)) { updateData.email = formData.email; hasChanges = true; }
        if (hasChanged(formData.contact, user.contact)) { updateData.contact = formData.contact; hasChanges = true; }
        if (hasChanged(formData.domain, user.domain)) { updateData.domain = formData.domain; hasChanges = true; }
        if (hasChanged(formData.occupation, user.occupation)) { updateData.occupation = formData.occupation; hasChanges = true; }
        if (formData.user_logo !== user.user_logo) { updateData.user_logo = formData.user_logo; hasChanges = true; }

        // SPECIAL HANDLING FOR DESCRIPTION + LOCATION
        let finalDescription = formData.description;
        if (user.user_type === UserType.PERSON && formData.location) {
          // Append location if provided
          finalDescription = `${formData.description} [Location: ${formData.location}]`;
        }

        // We compare against the ORIGINAL DB VALUE which contains the location tag (if any)
        // Or we just force update if we constructed a new description
        if (hasChanged(finalDescription, user.description)) {
          updateData.description = finalDescription;
          hasChanges = true;
        }

        // Only update location field directly if it's an organization (backward compat)
        if (user.user_type === UserType.ORGANIZATION) {
          if (hasChanged(formData.location, user.location)) { updateData.location = formData.location; hasChanges = true; }
        }
      }

      if (!hasChanges) {
        showToast('Aucune modification détectée.', 'info');
        setSaving(false);
        return;
      }

      await userService.updateProfile(updateData);

      const updatedUser = await userService.getCurrentUser();
      setUser(updatedUser);

      showToast('Profil mis à jour avec succès !', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (passwords.new.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    setSaving(true);

    try {
      await userService.updateProfile({ password: passwords.new });
      showToast('Mot de passe mis à jour avec succès !', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3rem', color: '#6A1B9A' }}
        >
          <i className="fas fa-spinner"></i>
        </motion.div>
      </div>
    );
  }

  const isPerson = user?.user_type === UserType.PERSON;

  return (
    <PageTransition>
      <div className="content-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-user-edit" style={{ marginRight: '12px', color: '#6A1B9A' }}></i>
            Modifier mon profil
          </h1>
        </div>
      </div>

      <style jsx>{`
        .edit-profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .edit-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(106, 27, 154, 0.08);
          border: 1px solid rgba(106, 27, 154, 0.1);
          transition: all 0.3s ease;
        }

        .edit-card:hover {
          box-shadow: 0 12px 32px rgba(106, 27, 154, 0.12);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .card-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2C3E50;
          margin: 0;
        }

        .card-header i {
          font-size: 1.5rem;
          color: #6A1B9A;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #2C3E50;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E0E0E0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6A1B9A;
          box-shadow: 0 0 0 3px rgba(106, 27, 154, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .avatar-upload-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f9f7ff 0%, #fff 100%);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .avatar-preview {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #6A1B9A;
          box-shadow: 0 8px 20px rgba(106, 27, 154, 0.2);
        }

        .upload-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(106, 27, 154, 0.3);
        }

        .submit-btn {
          width: 100%;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(106, 27, 154, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .full-width-card {
          grid-column: 1 / -1;
        }

        @media (max-width: 992px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="edit-profile-container">

        <form onSubmit={handleProfileSubmit}>
          <div className="profile-grid">
            {/* Avatar Section */}
            <div className="edit-card full-width-card">
              <div className="card-header">
                <i className="fas fa-image"></i>
                <h2>Photo de profil</h2>
              </div>
              <div className="avatar-upload-section">
                <div className="avatar-preview">
                  <Image
                    src={formData.user_logo || '/images/porw.jpg'}
                    alt="Avatar"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <label htmlFor="avatar-upload" className="upload-btn">
                    <i className="fas fa-cloud-upload-alt"></i>
                    {uploading ? 'Téléchargement...' : 'Changer la photo'}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                    JPG, PNG ou GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="edit-card">
              <div className="card-header">
                <i className="fas fa-id-card"></i>
                <h2>Informations personnelles</h2>
              </div>

              {isPerson ? (
                <>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      name="user_firstname"
                      value={formData.user_firstname || ''}
                      onChange={handleInputChange}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="user_lastname"
                      value={formData.user_lastname || ''}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: Développeur, Designer..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Localisation</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: Yaoundé, Cameroun"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Nom de l'organisation</label>
                    <input
                      type="text"
                      name="user_lastname"
                      value={formData.user_lastname || ''}
                      onChange={handleInputChange}
                      placeholder="Nom de votre organisation"
                    />
                  </div>
                  <div className="form-group">
                    <label>Localisation</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: Yaoundé, Cameroun"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="edit-card">
              <div className="card-header">
                <i className="fas fa-address-book"></i>
                <h2>Coordonnées</h2>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact || ''}
                  onChange={handleInputChange}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div className="form-group">
                <label>Domaine d'activité</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Technologie, Éducation..."
                />
              </div>
            </div>

            {/* Description */}
            <div className="edit-card full-width-card">
              <div className="card-header">
                <i className="fas fa-align-left"></i>
                <h2>Description</h2>
              </div>

              <div className="form-group">
                <label>À propos de {isPerson ? 'vous' : 'votre organisation'}</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Décrivez-vous en quelques mots..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Enregistrer les modifications
              </>
            )}
          </button>
        </form>

        {/* Password Section */}
        <form onSubmit={handlePasswordSubmit} style={{ marginTop: '2rem' }}>
          <div className="edit-card">
            <div className="card-header">
              <i className="fas fa-lock"></i>
              <h2>Modifier le mot de passe</h2>
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Retapez votre mot de passe"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Mise à jour...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Mettre à jour le mot de passe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
