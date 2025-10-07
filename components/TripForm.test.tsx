import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TripForm from './TripForm';

describe('TripForm Component', () => {
  it('debería llamar a onFormSubmit con los datos correctos al enviar', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm title="Test Form" onFormSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText('Nombre');
    const emailInput = screen.getByLabelText('Email');
    const messageInput = screen.getByLabelText('Mensaje');
    const submitButton = screen.getByText('Enviar Consulta');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message.' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ name: 'Test User', email: 'test@example.com', message: 'This is a test message.' });
    });
  });
});