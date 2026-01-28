import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchServiceData();
  }, [id]);

  const fetchServiceData = async () => {
    try {
      const [serviceRes, projectsRes] = await Promise.all([
        axios.get(`${API_URL}/api/services/${id}`),
        axios.get(`${API_URL}/api/services/${id}/projects`)
      ]);

      setService(serviceRes.data);
      setProjects(projectsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching service data:', error);
      setLoading(false);
    }
  };

  const handleImageClick = (project) => {
    if (project.media_type === 'image') {
      setZoomedImage(project);
    }
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  if (loading) {
    return (
      <div className="service-detail">
        <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail">
        <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Service not found</p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <motion.button 
        className="back-button" 
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        ← Back to Home
      </motion.button>

      <motion.div 
        className="service-header"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{service.title}</h1>
        <p>{service.description}</p>
      </motion.div>

      {projects.length === 0 ? (
        <motion.p 
          style={{ textAlign: 'center', fontSize: '1.3rem', opacity: 0.7 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          No projects available yet for this service.
        </motion.p>
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="project-media"
                onClick={() => handleImageClick(project)}
              >
                {project.media_type === 'image' ? (
                  <img 
                    src={project.media_url} 
                    alt={project.title}
                    title="Click to view full size"
                  />
                ) : (
                  <video controls>
                    <source src={project.media_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            className="image-zoom-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeZoom}
          >
            <motion.div 
              className="image-zoom-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="image-zoom-close" 
                onClick={closeZoom}
                title="Close (or click outside)"
              >
                ×
              </button>
              <img 
                src={zoomedImage.media_url} 
                alt={zoomedImage.title}
              />
              <div className="image-zoom-info">
                <h3>{zoomedImage.title}</h3>
                <p>{zoomedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetail;
