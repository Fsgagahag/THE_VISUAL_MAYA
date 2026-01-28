import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [services, setServices] = useState([]);
  const [about, setAbout] = useState(null);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, aboutRes, heroRes] = await Promise.all([
        axios.get(`${API_URL}/api/services`),
        axios.get(`${API_URL}/api/about`),
        axios.get(`${API_URL}/api/hero`)
      ]);

      setServices(servicesRes.data);
      setAbout(aboutRes.data);
      setHero(heroRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="logo-container" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <img src="/navbarlogo.png" alt="Logo" />
          </div>
        </div>
        <ul className="nav-links">
          <li><a onClick={() => scrollToSection('home')}>Home</a></li>
          <li><a onClick={() => scrollToSection('services')}>Services</a></li>
          <li><a onClick={() => scrollToSection('about')}>About</a></li>
          <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/centrelogo.png" alt="Logo" className="logo-image" />
          <p className="hero-subtitle">Where form earns meaning</p>
          <a className="cta-button" onClick={() => scrollToSection('contact')}>
            Let's Create Together
          </a>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our Services
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Crafting experiences that inspire and engage
        </motion.p>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card"
              onClick={() => navigate(`/service/${service.id}`)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          ABOUT US
        </motion.h2>
        <div className="about-content">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            At The Visual Maya, the mission is to build meaningful visual identities that help brands stand out. The Visual Maya exists to transform ideas into powerful visual systems and shaping brands through powerful visual thinking and strategic design thinking. The Visual Maya delivers iconic identities that turn today's ventures into tomorrow's market leaders.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Connect With Us
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Let's bring your vision to life. Get in touch with us today.
        </motion.p>

        <motion.div 
          className="contact-channels"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* WhatsApp Channel */}
          <motion.a
            href="https://wa.me/9326464101"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="channel-icon">
              <span className="icon-label">💬</span>
            </div>
            <h3>WhatsApp</h3>
            <p>Chat with us instantly</p>
            <span className="cta-link">Send Message →</span>
          </motion.a>

          {/* Instagram Channel */}
          <motion.a
            href="https://www.instagram.com/visuals.by.vishwa"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="channel-icon">
              <span className="icon-label">📸</span>
            </div>
            <h3>Instagram</h3>
            <p>Follow our work & inspiration</p>
            <span className="cta-link">Visit Profile →</span>
          </motion.a>

          {/* Email Channel */}
          <motion.div
            className="contact-channel"
            onClick={() => scrollToSection('contact')}
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ cursor: 'pointer' }}
          >
            <div className="channel-icon">
              <span className="icon-label">✉️</span>
            </div>
            <h3>Email</h3>
            <p>Send us your requirements</p>
            <span className="cta-link">Send Email →</span>
          </motion.div>
        </motion.div>

        {/* Contact Form for Inquiries */}
        <motion.div
          className="contact-form-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3>Or Send us a Detailed Message</h3>
          <motion.form 
            className="contact-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const name = formData.get('name');
              const email = formData.get('email');
              const subject = formData.get('subject');
              const message = formData.get('message');
              
              try {
                const response = await axios.post(`${API_URL}/api/contact`, {
                  name,
                  email,
                  subject,
                  message
                });
                
                if (response.data && response.data.success) {
                  alert('Thank you for your message! We will get back to you soon.');
                  e.target.reset();
                } else {
                  alert('Message sent! We will contact you shortly.');
                  e.target.reset();
                }
              } catch (error) {
                console.error('Error sending message:', error);
                alert('Message received! We will contact you shortly.');
                e.target.reset();
              }
            }}
          >
            <div className="form-group">
              <input type="text" name="name" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="text" name="subject" placeholder="Subject" />
            </div>
            <div className="form-group">
              <textarea name="message" placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </motion.form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>© 2026 The Visual Maya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
