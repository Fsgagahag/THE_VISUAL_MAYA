import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState(null);
  const [hero, setHero] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

useEffect(() => {
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      const getAuthHeaders = () => ({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const [servicesRes, projectsRes, aboutRes, heroRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/services`),
          axios.get(
            `${API_URL}/api/admin/projects`,
            getAuthHeaders()
          ),
          axios.get(`${API_URL}/api/about`),
          axios.get(`${API_URL}/api/hero`)
        ]);

      setServices(servicesRes.data);
      setProjects(projectsRes.data);
      setAbout(aboutRes.data);
      setHero(heroRes.data);

      try {
        const messagesRes = await axios.get(
          `${API_URL}/api/admin/contacts`,
          getAuthHeaders()
        );

        setMessages(messagesRes.data || []);
      } catch (messageError) {
        console.warn(
          'Could not fetch messages:',
          messageError.message
        );
        setMessages([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  fetchAllData();
}, [navigate]);


  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'service') {
      setFormData(item || { title: '', description: '', image: '', order: 0 });
    } else if (type === 'project') {
      setFormData(item || { 
        service_id: services[0]?.id || '',
        title: '', 
        description: '', 
        media_type: 'image',
        media_url: '',
        order: 0 
      });
    } else if (type === 'about') {
      setFormData(about || {
        description1: '',
        description2: '',
        projects_completed: 0,
        happy_clients: 0,
        years_experience: 0
      });
    } else if (type === 'hero') {
      setFormData(hero || {
        logo_url: '',
        title: '',
        subtitle: ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const fieldName = e.target.name;
      setFormData({
        ...formData,
        [fieldName]: response.data.url
      });
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === 'service') {
        if (editingItem) {
          await axios.put(`${API_URL}/api/admin/services/${editingItem.id}`, formData, getAuthHeaders());
        } else {
          await axios.post(`${API_URL}/api/admin/services`, formData, getAuthHeaders());
        }
      } else if (modalType === 'project') {
        if (editingItem) {
          await axios.put(`${API_URL}/api/admin/projects/${editingItem.id}`, formData, getAuthHeaders());
        } else {
          await axios.post(`${API_URL}/api/admin/projects`, formData, getAuthHeaders());
        }
      } else if (modalType === 'about') {
        await axios.put(`${API_URL}/api/admin/about`, formData, getAuthHeaders());
      } else if (modalType === 'hero') {
        await axios.put(`${API_URL}/api/admin/hero`, formData, getAuthHeaders());
      }

      alert(`${modalType} ${editingItem ? 'updated' : 'created'} successfully!`);
      closeModal();
      fetchAllData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'service') {
        await axios.delete(`${API_URL}/api/admin/services/${id}`, getAuthHeaders());
      } else if (type === 'project') {
        await axios.delete(`${API_URL}/api/admin/projects/${id}`, getAuthHeaders());
      } else if (type === 'message') {
        await axios.delete(`${API_URL}/api/admin/contacts/${id}`, getAuthHeaders());
      }

      alert('Item deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Section
        </button>
        <button
          className={`tab-button ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
      </div>

      <div className="dashboard-content">
        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div>
            <button className="add-button" onClick={() => openModal('service')}>
              + Add New Service
            </button>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id}>
                    <td>{service.title}</td>
                    <td>{service.description.substring(0, 50)}...</td>
                    <td>{service.order}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-button" onClick={() => openModal('service', service)}>
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDelete('service', service.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div>
            <button className="add-button" onClick={() => openModal('project')}>
              + Add New Project
            </button>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Media</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id}>
                    <td>{project.serviceid?.title || 'N/A'}</td>
                    <td>{project.title}</td>
                    <td>{project.description.substring(0, 50)}...</td>
                    <td>{project.media_type}</td>
                    <td>
                      {project.media_type === 'image' ? (
                        <img src={project.media_url} alt={project.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} />
                      ) : (
                        <span>Video</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-button" onClick={() => openModal('project', project)}>
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDelete('project', project.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ABOUT SECTION TAB */}
        {activeTab === 'about' && (
          <div>
            <button className="add-button" onClick={() => openModal('about')}>
              Edit About Section
            </button>
            {about && (
              <div style={{ padding: '2rem', background: '#f8f8f8', borderRadius: '10px', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Current About Section</h3>
                <p><strong>Description 1:</strong> {about.description1}</p>
                <p><strong>Description 2:</strong> {about.description2}</p>
                <p><strong>Projects Completed:</strong> {about.projects_completed}</p>
                <p><strong>Happy Clients:</strong> {about.happy_clients}</p>
                <p><strong>Years Experience:</strong> {about.years_experience}</p>
              </div>
            )}
          </div>
        )}

        {/* HERO SECTION TAB */}
        {activeTab === 'hero' && (
          <div>
            <button className="add-button" onClick={() => openModal('hero')}>
              Edit Hero Section
            </button>
            {hero && (
              <div style={{ padding: '2rem', background: '#f8f8f8', borderRadius: '10px', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Current Hero Section</h3>
                <p><strong>Logo URL:</strong> {hero.logo_url}</p>
                <p><strong>Title:</strong> {hero.title}</p>
                <p><strong>Subtitle:</strong> {hero.subtitle}</p>
                {hero.logo_url && (
                  <img src={hero.logo_url} alt="Logo" style={{ width: '100px', marginTop: '1rem', borderRadius: '10px' }} />
                )}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div>
            <h2>Contact Form Messages</h2>
            {messages.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No messages yet</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(message => (
                    <tr key={message.id}>
                      <td>{message.name}</td>
                      <td>{message.email}</td>
                      <td>{message.subject || 'No Subject'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {message.message}
                      </td>
                      <td>{new Date(message.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="delete-button" 
                            onClick={() => handleDelete('message', message.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingItem ? 'Edit' : 'Add'} {modalType}
            </h2>
            <form onSubmit={handleSubmit}>
              {modalType === 'service' && (
                <>
                  <div>
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {modalType === 'project' && (
                <>
                  <div>
                    <label>Service *</label>
                    <select
                      name="service_id"
                      value={formData.service_id || ''}
                      onChange={handleInputChange}
                      required
                    >
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Media Type *</label>
                    <select
                      name="media_type"
                      value={formData.media_type || 'image'}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label>Media URL *</label>
                    <input
                      type="text"
                      name="media_url"
                      value={formData.media_url || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Or upload file below"
                    />
                  </div>
                  <div>
                    <label>Upload Media</label>
                    <input
                      type="file"
                      name="media_url"
                      accept={formData.media_type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div>
                    <label>Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {modalType === 'about' && (
                <>
                  <div>
                    <label>Description 1</label>
                    <textarea
                      name="description1"
                      value={formData.description1 || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Description 2</label>
                    <textarea
                      name="description2"
                      value={formData.description2 || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Projects Completed</label>
                    <input
                      type="number"
                      name="projects_completed"
                      value={formData.projects_completed || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Happy Clients</label>
                    <input
                      type="number"
                      name="happy_clients"
                      value={formData.happy_clients || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Years Experience</label>
                    <input
                      type="number"
                      name="years_experience"
                      value={formData.years_experience || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {modalType === 'hero' && (
                <>
                  <div>
                    <label>Logo URL</label>
                    <input
                      type="text"
                      name="logo_url"
                      value={formData.logo_url || ''}
                      onChange={handleInputChange}
                      placeholder="Or upload file below"
                    />
                  </div>
                  <div>
                    <label>Upload Logo</label>
                    <input
                      type="file"
                      name="logo_url"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div>
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Save
                </button>
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;