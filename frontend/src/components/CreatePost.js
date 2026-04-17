import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPenFancy,
  FaTimes,
  FaCloudUploadAlt,
  FaMagic,
  FaHashtag,
  FaStar,
  FaTrash
} from 'react-icons/fa';

const CreatePost = ({ show, handleClose }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setContent('');
        setTags([]);
        setImage(null);
        setPreview('');
        setMessage('');
      }, 500);
    }
  }, [show]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTag.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setCurrentTag('');
      }
    } else if (e.key === 'Backspace' && !currentTag && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePost = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    const token = window.localStorage.getItem('token');
    if (!token) {
      setMessage('🔒 Please log in to post.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (!content.trim() && !image) {
      setMessage('Please add some content or an image.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (tags.length > 0) {
      formData.append('tag', tags.join(', '));
    } else if (currentTag) {
      formData.append('tag', currentTag);
    }

    if (image) formData.append('image', image);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/liner/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'auth-token': token,
        },
      });

      setMessage('✨ Posted Successfully!');
      setMessageType('success');

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Post creation error:', error);
      setMessage(error.response?.data?.message || '❌ Failed to create post');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      contentClassName="border-0 rounded-3xl shadow-2xl overflow-hidden bg-transparent"
      backdropClassName="backdrop-blur-md bg-slate-900/40"
    >
      <div className="bg-white relative overflow-hidden flex flex-col min-h-[600px]">

        {/* Animated Background Mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <Modal.Header className="border-b-0 flex items-center justify-between p-6 relative z-10 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30"
            >
              <FaPenFancy className="text-xl" />
            </motion.div>
            <div>
              <h4 className="m-0 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight text-2xl">
                Create Post
              </h4>
              <p className="m-0 text-sm text-slate-500 font-medium flex items-center gap-1">
                Share your vibe <FaStar className="text-yellow-500" />
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 border-0 bg-transparent"
          >
            <FaTimes size={20} />
          </motion.button>
        </Modal.Header>

        <Modal.Body className="p-6 md:p-8 space-y-8 relative z-10">

          {/* Main Content Input */}
          <div className="relative group">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What's sparking your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-0 bg-transparent text-xl md:text-2xl text-slate-700 placeholder:text-slate-300 focus:ring-0 px-0 resize-none font-medium leading-relaxed"
              style={{ boxShadow: 'none' }}
            />
            <div className="absolute bottom-0 right-0">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-all duration-300 ${content.length > 900
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-white text-slate-400 border-slate-100 opacity-0 group-hover:opacity-100'
                }`}>
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Upload Area */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`
              relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group min-h-[220px] flex flex-col justify-center
              ${isDragging
                ? 'border-violet-500 bg-violet-50/50'
                : preview
                  ? 'border-transparent p-0'
                  : 'border-slate-200 bg-slate-50/50 hover:border-violet-400 hover:bg-slate-50'
              }
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
            />

            {preview ? (
              <div className="relative w-full h-[300px] group-hover:shadow-inner">
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setPreview('');
                    }}
                    className="bg-red-500/90 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg backdrop-blur-sm flex items-center gap-2 border-0"
                  >
                    <FaTrash /> Remove Image
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className={`
                    w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4 transition-all duration-500
                    ${isDragging
                    ? 'bg-violet-100 text-violet-600 rotate-12 scale-110 shadow-xl'
                    : 'bg-white text-violet-400 shadow-lg shadow-violet-100 group-hover:scale-110 group-hover:-rotate-6'
                  }
                 `}>
                  <FaCloudUploadAlt />
                </div>
                <h5 className="text-slate-700 font-bold text-lg mb-1 group-hover:text-violet-600 transition-colors">
                  Add Photos & Videos
                </h5>
                <p className="text-slate-400 text-sm mb-0">
                  Drag & drop or click to browse
                </p>
              </div>
            )}
          </motion.div>

          {/* Tags */}
          <div className="bg-slate-50/80 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-100 min-h-[60px] items-center relative focus-within:ring-2 focus-within:ring-violet-100 focus-within:border-violet-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm ml-1">
              <FaHashtag />
            </div>

            {tags.map((tag, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white text-slate-700 pl-3 pr-2 py-1.5 rounded-xl text-sm font-bold shadow-sm shadow-slate-200 border border-slate-100 flex items-center gap-2"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  {tag}
                </span>
                <button
                  onClick={() => removeTag(tag)}
                  className="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              </motion.span>
            ))}

            <input
              className="bg-transparent border-0 outline-none text-slate-600 placeholder:text-slate-400 min-w-[140px] flex-1 px-2 font-medium"
              placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>

          {/* Messages */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg ${messageType === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/20'
                  }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </Modal.Body>

        <Modal.Footer className="border-t-0 p-6 md:p-8 pt-0 relative z-10 bg-transparent">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className={`
               w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl shadow-violet-500/20 flex items-center justify-center gap-3 transition-all border-0 relative overflow-hidden
               ${isSubmitting || (!content && !image)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600'
              }
             `}
            onClick={handlePost}
            disabled={isSubmitting || (!content && !image)}
          >
            {/* Shimmer Effect */}
            {!isSubmitting && content && (
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}

            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <FaMagic className="text-yellow-300" /> Publish Now
              </>
            )}
          </motion.button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default CreatePost;
