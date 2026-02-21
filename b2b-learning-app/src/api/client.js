import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 20000,
});

export const createClient = async () => {
  const response = await api.post('/create_client');
  return response.data;
};

export const createProject = async (payload) => {
  const response = await api.post('/create_project', payload);
  return response.data;
};

export const getQuestions = async (payload) => {
  const response = await api.post('/get_questions', payload);
  return response.data;
};

export const tutorChat = async (messages, exerciseContext = '') => {
  const response = await api.post('/tutor_chat', {
    messages: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
    exercise_context: exerciseContext,
  });
  return response.data;
};

export default api;
