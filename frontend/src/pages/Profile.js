import React, { useEffect, useRef, useState, useContext } from 'react';
import axios from 'axios';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { UserContext } from '../contexts/UserContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ShieldLockFill,
  PersonFill,
  EnvelopeFill,
  KeyFill,
  CameraFill,
  ArrowLeft,
  CheckCircleFill
} from 'react-bootstrap-icons';

const Profile = () => {
  const { user, setUser, authError } = useContext(UserContext);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const fileInputRef = useRef();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setForm({ name: user.name, email: user.email });
        setProfilePicPreview(user.profilePicture || '');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.post(
          `${API_BASE}/auth/getuser`,
          {},
          { headers: { 'auth-token': token } }
        );
        if (res.data.success) {
          setUser(res.data.user);
          setForm({ name: res.data.user.name, email: res.data.user.email });
          setProfilePicPreview(res.data.user.profilePicture || '');
        }
      } catch (err) {
        setMsg('Failed to fetch user');
      }
    };
    fetchUser();
  }, [user, setUser, API_BASE]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: user.name, email: user.email });
    setProfilePicPreview(user.profilePicture || '');
    setProfilePicFile(null);
    setMsg('');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    setLoading(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', profilePicFile);
      const res = await axios.put(
        `${API_BASE}/users/profile-picture/${user._id}`,
        formData,
        { headers: { 'auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        setUser(res.data.user);
        setProfilePicPreview(res.data.user.profilePicture);
        setProfilePicFile(null);
        setMsg('Profile picture updated!');
      } else {
        setMsg(res.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Profile pic upload error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
      setMsg(errorMsg);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const updateData = { name: form.name, email: form.email };
      const res = await axios.patch(
        `${API_BASE}/auth/update`,
        updateData,
        { headers: { 'auth-token': token } }
      );
      if (res.data.success) {
        setUser(res.data.user);
        setEditMode(false);
        setMsg('Profile updated!');
      } else {
        setMsg(res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Update failed';
      setMsg(errorMsg);
    }
    setLoading(false);
  };

  if (authError) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <Alert variant="danger" className="text-center">{authError}</Alert>
      </PageWrapper>
    );
  }

  if (!user) return (
    <PageWrapper className="flex items-center justify-center">
      <Spinner animation="border" variant="primary" />
    </PageWrapper>
  );

  return (
    <PageWrapper>

      <div className="max-w-3xl mx-auto px-4 py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassFormCard>
            <HeaderSection>
              <h1 className="text-4xl font-extrabold text-white mb-2">Edit Profile</h1>
              <p className="text-indigo-300 font-medium">Manage your digital identity & privacy</p>
            </HeaderSection>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative group cursor-pointer" onClick={() => editMode && fileInputRef.current.click()}>
                <AvatarRing
                  animate={editMode ? { rotate: 360 } : {}}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {editMode && (
                    <CameraOverlay>
                      <CameraFill size={24} />
                    </CameraOverlay>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </div>

              {editMode && profilePicFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <UploadBtn onClick={handleProfilePicUpload} disabled={loading}>
                    {loading ? <Spinner size="sm" className="me-2" /> : <CheckCircleFill className="me-2" />}
                    {loading ? 'Uploading...' : 'Confirm New Picture'}
                  </UploadBtn>
                </motion.div>
              )}

              {!editMode && (
                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-gray-400 font-medium">{user.email}</p>
                </div>
              )}
            </div>

            {msg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
                <Alert variant={msg.includes('updated') ? 'success' : 'danger'} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-2xl inline-block px-12">
                  {msg}
                </Alert>
              </motion.div>
            )}

            {editMode ? (
              <Form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormGroup>
                    <Label><PersonFill className="me-2" /> Full Name</Label>
                    <GlassInput
                      name="name"
                      value={form.name || ''}
                      onChange={handleChange}
                      required
                      placeholder="Enter your name"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label><EnvelopeFill className="me-2" /> Email Address</Label>
                    <GlassInput
                      name="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      required
                      placeholder="Enter email"
                    />
                  </FormGroup>
                </div>

                <div className="flex gap-4 pt-6">
                  <CancelBtn type="button" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </CancelBtn>
                  <SaveBtn type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                  </SaveBtn>
                </div>
              </Form>
            ) : (
              <div className="flex flex-col gap-6">
                <EditMainBtn onClick={handleEdit}>
                  <PersonFill className="me-2" /> Edit Basic Info
                </EditMainBtn>

                <hr className="border-white/5 my-4" />

                {/* Account Settings Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldLockFill className="text-indigo-400" /> Account Settings
                  </h3>

                  <div className="space-y-4">
                    <SettingCard>
                      <div className="flex-1">
                        <SettingTitle>Private Account</SettingTitle>
                        <SettingDesc>
                          {user.isPrivate ? 'Only followers can see your profile details' : 'Anyone on Liner can see your posts'}
                        </SettingDesc>
                      </div>
                      <ToggleBtn
                        active={user.isPrivate}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await axios.put(
                              `${API_BASE}/users/toggle-privacy`,
                              {},
                              { headers: { 'auth-token': token } }
                            );
                            if (res.data.success) {
                              setUser({ ...user, isPrivate: res.data.isPrivate });
                            }
                          } catch (err) {
                            console.error('Failed to toggle privacy:', err);
                          }
                        }}
                      >
                        {user.isPrivate ? 'Make Public' : 'Make Private'}
                      </ToggleBtn>
                    </SettingCard>

                    {user.isPrivate && (
                      <SettingCard onClick={() => window.location.href = '/follow-requests'} className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex-1">
                          <SettingTitle>Follow Requests</SettingTitle>
                          <SettingDesc>Manage pending follower requests</SettingDesc>
                        </div>
                        <div className="flex items-center gap-3">
                          {user.followRequests?.length > 0 && (
                            <Badge>{user.followRequests.length} Pending</Badge>
                          )}
                          <ArrowLeft className="rotate-180" />
                        </div>
                      </SettingCard>
                    )}

                    <SettingCard onClick={() => setEditMode(true)} className="cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex-1">
                        <SettingTitle>Update Password</SettingTitle>
                        <SettingDesc>Change your account security credentials</SettingDesc>
                      </div>
                      <KeyFill className="text-gray-500" />
                    </SettingCard>
                  </div>
                </div>
              </div>
            )}

            {/* --- PASSWORD MODAL/SECTION (When in edit mode) --- */}
            {editMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-12 pt-12 border-t border-white/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyFill className="text-indigo-400" /> Security Update
                  </h3>
                  <Button
                    variant="link"
                    className="text-indigo-400 p-0 hover:text-indigo-300 no-underline"
                    onClick={() => setShowPasswordFields((v) => !v)}
                  >
                    {showPasswordFields ? 'Hide Security Forms' : 'Open Password Manager'}
                  </Button>
                </div>

                {showPasswordFields && (
                  <Form
                    className="space-y-6"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      setPasswordMsg('');
                      try {
                        const token = localStorage.getItem('token');
                        const res = await axios.patch(
                          `${API_BASE}/auth/update`,
                          { password: newPassword, currentPassword },
                          { headers: { 'auth-token': token } }
                        );
                        if (res.data.success) {
                          setPasswordMsg('Password updated successfully!');
                          setCurrentPassword('');
                          setNewPassword('');
                          setShowPasswordFields(false);
                        } else {
                          setPasswordMsg(res.data.message || 'Verification failed');
                        }
                      } catch (err) {
                        setPasswordMsg(err.response?.data?.message || 'Update failed');
                      }
                      setLoading(false);
                    }}
                  >
                    <FormGroup>
                      <Label>Current Password</Label>
                      <GlassInput
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>New Secure Password</Label>
                      <GlassInput
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new password"
                      />
                    </FormGroup>
                    <div className="flex justify-end">
                      <SaveBtn type="submit" disabled={loading} className="w-auto px-12">
                        {loading ? <Spinner animation="border" size="sm" /> : 'Confirm New Password'}
                      </SaveBtn>
                    </div>
                    {passwordMsg && (
                      <Alert variant="info" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 rounded-2xl mt-4">
                        {passwordMsg}
                      </Alert>
                    )}
                  </Form>
                )}
              </motion.div>
            )}
          </GlassFormCard>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

// --- Styled Components ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
  pointer-events: auto;
`;

const GlassFormCard = styled.div`
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(45px) saturate(2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  padding: 60px;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
  color: #fff;
  position: relative;
  overflow: hidden;
  pointer-events: auto;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const AvatarRing = styled(motion.div)`
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px dashed rgba(99, 102, 241, 0.4);
`;

const CameraOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  
  .group:hover & {
    opacity: 1;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
`;

const GlassInput = styled.input`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 20px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.07);
    border-color: #6366f1;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
`;

const SaveBtn = styled.button`
  flex: 2;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  padding: 14px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 14px;
  border-radius: 18px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditMainBtn = styled.button`
  width: 100%;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 16px;
  border-radius: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.2);
    color: #fff;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SettingCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  gap: 20px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }

  &:active {
    transform: translateX(0);
  }
`;

const SettingTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
`;

const SettingDesc = styled.p`
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
`;

const ToggleBtn = styled.button`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid ${props => props.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.active ? '#f87171' : '#34d399'};

  &:hover {
    background: ${props => props.active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  background: #ef4444;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 100px;
  text-transform: uppercase;
`;

const UploadBtn = styled.button`
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 8px 20px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.25);
    color: #fff;
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Profile;