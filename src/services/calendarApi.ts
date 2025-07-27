
import { ENDPOINTS } from '../constants/apiEndpoints';

export type AppointmentType = 'BANHO' | 'VET';

export const fetchEvents = async (
  start: string,
  end: string,
  type: AppointmentType = 'VET'
) => {
  const endpoint = type === 'BANHO' ? ENDPOINTS.BANHO.GET : ENDPOINTS.VET.GET;
  const response = await fetch(`${endpoint}?start=${start}&end=${end}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export const addEvent = async (eventData: any, type: AppointmentType = 'VET') => {
  const endpoint = type === 'BANHO' ? ENDPOINTS.BANHO.ADD : ENDPOINTS.VET.ADD;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('Failed to add event');
  }
  return response.json();
};

export const updateEvent = async (eventData: any, type: AppointmentType = 'VET') => {
  const endpoint = type === 'BANHO' ? ENDPOINTS.BANHO.UPDATE : ENDPOINTS.VET.UPDATE;
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  return response.json();
};

export const deleteEvent = async (eventId: string, type: AppointmentType = 'VET') => {
  const endpoint = type === 'BANHO' ? ENDPOINTS.BANHO.DELETE : ENDPOINTS.VET.DELETE;
  const response = await fetch(`${endpoint}/${eventId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
  return response.json();
};
